const User = require("../models/user.model");
const Subject = require("../models/subject.model");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

// ================ PARAM FUNCTIONS ===================================

exports.getSubjectById = async (req, res, next, id) => {
  Subject.findById(id).exec((err, subject) => {
    if (err || !subject) {
      return res.status(404).json({
        error: "subject not found for this id",
      });
    }

    // user found
    req.subject = subject;
    next();
  });
};

// ================= CONTROLLERS ======================================

exports.createSubject = async (req, res) => {
  const subject = new Subject(req.body);

  try {
    let savedSubject = await subject.save();
    if (!savedSubject) {
      return res.status(400).json({
        error: "error creating new subject",
      });
    } else {
      return res.status(200).json(savedSubject);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

exports.updateSubject = async (req, res) => {
  // update subject api only updates subtopics in the database
  const subtopics = req.body.subtopics;

  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.subject._id },
      { $set: { subtopics: subtopics } },
      { new: true }
    );

    if (!subject) {
      console.log("subject not found in db");
      return res.status(404).json({
        error: "subject not found in DB",
      });
    } else {
      console.log("subtopic list is updated!!");
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

exports.getAllSubjects = async (req, res) => {
  const goalId = req.profile.goalSelected;

  try {
    const subjects = await Subject.find({ goalId: goalId, free: false });
    if (!subjects) {
      return res.status(404).json({
        error: "no subject found for goal selected by user",
      });
    } else {
      subjects.map((subject) => {
        subject.subtopics = undefined;
        subject.goalId = undefined;
        subject.subjectDescription = undefined;
        // subject.instructor = undefined;
        subject.instructorId = undefined;
        subject.price = undefined;
        // subject.free = undefined;
        subject.duration = undefined;
        subject.createdAt = undefined;
        subject.updatedAt = undefined;
        subject.__v = undefined;
      });

      return res.status(200).json(subjects);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

// do not touch this API at all. It is very fragile in nature.
exports.getSubjectData = async (req, res) => {
  console.log("called");
  let flag = 0;
  let userPurchaseList = req.profile.userPurchaseList;
  // check if requested subject is free
  if (req.subject.free == true) {
    try {
      const subject = await Subject.findOne({ _id: req.subject._id });
      if (!subject) {
        return res.status(404).json({
          error: "subject not found in database",
        });
      } else {
        return res.status(200).json(subject);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  // subject is paid
  else {
    // check if subject data is in user purchase list
    console.log(userPurchaseList);
    if (userPurchaseList.length <= 0) {
      console.log("userPurchaseList is empty");
      const subjectData = await nullSubjectData(req.subject._id);
      console.log(subjectData);
      return res.status(200).json(subjectData);
    }
    //
    else {
      console.log("checking if subject is in userPurchaseList");
      let trueFlag = 0;
      let setIndex = -1;

      for (let i = 0; i < userPurchaseList.length; i++) {
        if (
          userPurchaseList[i].subject_id.toString() ===
            req.subject._id.toString() &&
          userPurchaseList[i].isExpired === false
        ) {
          console.log("entered/");
          setIndex = i;
          trueFlag = 1;
          break;
        }
      }

      if (trueFlag !== 0) {
        // check if subject expiry is crossed
        const currentDate = dayjs().tz("Asia/Kolkata");
        if (currentDate.isAfter(dayjs(userPurchaseList[setIndex].expiryDate))) {
          console.log("expiry date is crossed");
          console.log("making changes in database");
          userPurchaseList[setIndex].isExpired = true;

          const user = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $set: { userPurchaseList: userPurchaseList } },
            { new: true }
          );

          if (!user) {
            return res.status(500).json({
              error: "userPurchaseList is not updated.",
            });
          } else {
            const subjectData = await nullSubjectData(req.subject._id);
            return res.status(200).json(subjectData);
          }
        } else {
          console.log("expiry date is not crossed.");
          try {
            const subject = await Subject.findOne({
              _id: userPurchaseList[setIndex].subject_id,
            });
            if (!subject) {
              return res.status(404).json({
                error: "subject not found in the database",
              });
            } else {
              console.log("SUBJECT FOUND: ", subject);
              return res.status(200).json(subject);
            }
          } catch (error) {
            console.log(error);
            return res.status(500).send(error);
          }
        }
      }
      //
      else {
        const subjectData = await nullSubjectData(req.subject._id);
        return res.status(200).json(subjectData);
      }
    }
  }
};

const nullSubjectData = async (subjectId) => {
  console.log("nullSubjectData is called");
  try {
    // subject validity expired ERR 403 only expose two first chapter
    const subject = await Subject.findOne({
      _id: subjectId,
    });
    if (!subject) {
      return res.status(404).json({
        error: "subject not found in the database",
      });
    } else {
      let newSubjectDTO = subject;
      let subtopics = newSubjectDTO.subtopics;

      for (let i = 0; i < subtopics.length; i++) {
        if (i !== 0) {
          let chapters = subtopics[i].chapters;

          for (let j = 0; j < chapters.length; j++) {
            chapters[j].chapterId = null;
            chapters[j].url = null;
          }
          // console.log(chapters);
        } else {
          let chapters = subtopics[i].chapters;
          for (let j = 1; j < chapters.length; j++) {
            chapters[j].chapterId = null;
            chapters[j].url = null;
          }
        }
      }

      // return this unexposed subject
      return newSubjectDTO;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

exports.getAdvertisements = async (req, res) => {
  // this api will give data of all free subjects under the goalId
  const goalId = req.profile.goalSelected;

  try {
    const subjects = await Subject.find({ goalId: goalId, free: true });

    if (!subjects) {
      return res.status(404).json({
        error: "error in getting free subjects under this goalId",
      });
    } else {
      subjects.map((subject) => {
        subject.subtopics = undefined;
        subject.goalId = undefined;
        subject.subjectDescription = undefined;
        // subject.instructor = undefined;
        subject.instructorId = undefined;
        subject.price = undefined;
        // subject.free = undefined;
        subject.duration = undefined;
        subject.createdAt = undefined;
        subject.updatedAt = undefined;
        subject.__v = undefined;
      });

      return res.status(200).json(subjects);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.getSubjectTemp = async (req, res) => {
  const subjectId = req.query.subjectId;
  let subtopicList = [];

  try {
    const subject = await Subject.findOne({ _id: subjectId });

    if (!subject) {
      return res.status(404).json({
        error: "subject not found in database",
      });
    }

    for (let i = 0; i < subject.subtopics.length; i++) {
      subtopicList.push({
        subtopicName: subject.subtopics[i].subtopicName,
        subtopicId: subject.subtopics[i].subtopicId,
      });
    }

    return res.status(200).json({
      subjectName: subject.subjectName,
      instructor: subject.instructor,
      price: subject.price,
      subjectDescription: subject.subjectDescription,
      duration: subject.duration,
      subtopics: subtopicList,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).end();
  }
};

// this api will be called only when user has purchased the course

exports.getSubtopicData = async (req, res) => {
  let subjectId = req.query.subjectId;
  let subtopicId = req.query.subtopicId.toString();

  try {
    const subjectData = await Subject.findOne({ _id: subjectId }).select([
      "subtopics",
    ]);

    let index = Number(subtopicId.split("-")[2]) - 1;
    let chapterList = subjectData.subtopics[index].chapters;

    const user = await User.findOne({ _id: req.profile._id }).select([
      "userPurchaseList",
    ]);

    if (user.userPurchaseList.length < 0) {
      return res.status(200).json({
        chapters: await nullChapterList(chapterList),
      });
    }

    for (let i = 0; i < user.userPurchaseList.length; i++) {
      if (
        user.userPurchaseList[i].subject_id == subjectId &&
        user.userPurchaseList[i].isExpired == false
      ) {
        // subject is in user purchase list and expiry date is not crossed
        if (
          (await checkForExpiryDate(user.userPurchaseList[i].expiryDate)) ===
          true
        ) {
          // expiry date is crossed
          let updatedUserPurchaseList = user.userPurchaseList;
          updatedUserPurchaseList[i].isExpired = true;

          const updatedUser = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $set: { userPurchaseList: updatedUserPurchaseList } },
            { new: true }
          );

          if (!updatedUser) {
            return res.status(500).json({
              error: "userPurchaseList is not updated.",
            });
          }

          return res.status(200).json({
            chapters: await nullChapterList(chapterList),
          });
        } else {
          return res.status(200).json({
            chapters: chapterList,
          });
        }
      } else {
        return res.status(200).json({
          chapters: await nullChapterList(chapterList),
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

const getUniqueCategoriesUnderGoalId = async (req, res) => {
  const goalId = req.query.goalId;

  const uniqueCategories = await Subject.find({ goalId: goalId }).distinct(
    "category"
  );

  console.log(uniqueCategories);
};

// ====================== FUNCTIONS ====================================================

const checkForExpiryDate = async (expiryDate) => {
  const currentDate = dayjs().tz("Asia/Kolkata");
  if (currentDate.isAfter(dayjs(expiryDate))) return true;
  else return false;
};

const nullChapterList = async (chapterList) => {
  for (let i = 0; i < chapterList.length; i++) {
    chapterList[i].url = null;
  }

  return chapterList;
};

// sample stringify json data for creating new subject

/*

        {
	"subjectName": "CSAT",
	"subjectId": "1001CSAT",
	"goalId": "1001",
	"subjectDescription": "The complete CSAT course for MPSC 2021 by Abhishek Thigale",
	"instructor": "Abhishek Thigale",
	"instructorId": "01",
	"subtopics": [{
			"subtopicName": "introduction to CSAT",
			"subtopicId": "1001CSAT01SID",
			"chapters": [
                {
					"chapterName": "बेसिक संकल्पना",
					"chapterId": "1001CSAT0101",
					"url": "https://www.youtube.com/embed/us6ttPiDhII"
				},
				{
					"chapterName": "BODMAS नियम",
					"chapterId": "1001CSAT0102",
					"url": "https://www.youtube.com/embed/QIX1Jw1Isxc"
				},
				{
					"chapterName": "काही मूळ संकल्पना",
					"chapterId": "1001CSAT0103",
					"url": "https://www.youtube.com/embed/QIX1Jw1Isxc"
				}
			]
		},
		{
			"subtopicName": "वेग अंतर आणि वेळ",
			"subtopicId": "1001CSAT02SID",
			"chapters": [
                {
					"chapterName": "वेगावरील मूळ सूत्रे",
					"chapterId": "1001CSAT0201",
					"url": "https://www.youtube.com/embed/us6ttPiDhII"
				},
				{
					"chapterName": "Solved Examples",
					"chapterId": "1001CSAT0202",
					"url": "https://www.youtube.com/embed/QIX1Jw1Isxc"
				},
				{
					"chapterName": "Past Year Questions",
					"chapterId": "1001CSAT0203",
					"url": "https://www.youtube.com/embed/QIX1Jw1Isxc"
				}
			]
		}
	],

	"price": "1500",
	"free": "false",
	"duration": "90",
	"thumbnail": "https://raw.githubusercontent.com/educulture-edutech/icons/main/default-subject-image.png"
}

*/

// const { subjectId, expiryDate } = req.body;

// // subject is free
// if (req.subject.free == true) {
//   try {
//     const subject = await Subject.findOne({
//       subjectId: subjectId,
//     });

//     if (!subject) {
//       return res.status(404).json({
//         error: "no subject found for this id",
//       });
//     } else {
//       return res.status(200).json(subject);
//     }
//   } catch (error) {
//     // exception, maybe db is broken when query data
//     console.log(error);
//     return res.status(500).send(error);
//   }
// }

// // else subject is paid
// else {
//   // check if user brought this course
//   const userPurchaseList = req.profile.userPurchaseList;

//   userPurchaseList.map(async (purchaseObj) => {
//     if (purchaseObj.subject_id == req.subject._id) {
//       // subject exist in userPurchaseList; now check the expiry date of user
//       const currentDate = dayjs();

//       if (currentDate.isAfter(dayjs(purchaseObj.expiryDate))) {
//         // currentDate crossed expiry date

//         purchaseObj.isExpired = true;
//         // get userPurchaseList
//         const userPurchaseList = req.profile.userPurchaseList;

//         // find the subject in userPurchaseList
//         userPurchaseList.map(async (subject, index) => {
//           if (subject.subjectId == subjectId) {
//             // update the isExpired flag
//             subject.isExpired = true;
//           }
//         });

//         // update the status in userPurchaseList
//         const user = await User.findOneAndUpdate(
//           { _id: req.profile._id },
//           { $set: { userPurchaseList: userPurchaseList } },
//           { new: true }
//         );

//         if (!user) {
//           return res.status(404).json({
//             error: "user not found to update userPurchaseList",
//           });
//         } else {
//           // user found, userPurchaseList updated.
//           return res.status(400).json({
//             error: "subject validity is expired",
//           });
//         }
//       } else {
//         try {
//           const subject = await Subject.findOne({
//             subjectId: subjectId,
//           });

//           if (!subject) {
//             return res.status(404).json({
//               error: "no subject found for this id",
//             });
//           } else {
//             return res.status(200).json(subject);
//           }
//         } catch (error) {
//           // exception, maybe db is broken when query data
//           console.log(error);
//           return res.status(500).send(error);
//         }
//       }
//     } else {
//       return res.status(404).json({
//         error: "subject not found in userPurchaseList",
//       });
//     }
//   });

//   const currentDate = dayjs();

//   if (currentDate.isAfter(dayjs(expiryDate))) {
//     //  currentDate crossed expiry date

//     // get userPurchaseList
//     const userPurchaseList = req.profile.userPurchaseList;

//     // find the subject in userPurchaseList
//     userPurchaseList.map((subject, index) => {
//       if (subject.subjectId == subjectId) {
//         // update the isExpired flag
//         subject.isExpired = true;
//       }
//     });

//     // update the status in userPurchaseList
//     const user = User.findOneAndUpdate(
//       { _id: req.profile._id },
//       { $set: { userPurchaseList: userPurchaseList } },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         error: "user not found to update userPurchaseList",
//       });
//     } else {
//       // user found, userPurchaseList updated.
//       return res.status(400).json({
//         error: "subject validity is expired",
//       });
//     }
//   } else {
//     try {
//       const subject = await Subject.findOne({
//         subjectId: subjectId,
//       });

//       if (!subject) {
//         return res.status(404).json({
//           error: "no subject found for this id",
//         });
//       } else {
//         return res.status(200).json(subject);
//       }
//     } catch (error) {
//       // exception, maybe db is broken when query data
//       console.log(error);
//       return res.status(500).send(error);
//     }
//   }
// }

// userPurchaseList.map(async (purchaseObj) => {
//   if (purchaseObj.subject_id == req.subject._id) {
//     // subject is in userPurchaseList
//     // check if it crossed expiry date
//     const currentDate = dayjs();
//     if (currentDate.isAfter(dayjs(purchaseObj.expiryDate))) {
//       purchaseObj.isExpired = true;
//       flag = 1;
//     } else {
//       // expiry date is not crossed. return subject data
//       const subject = await Subject.findOne({
//         _id: purchaseObj.subject_id,
//       });
//       if (!subject) {
//         return res.status(404).json({
//           error: "subject not found",
//         });
//       } else {
//         return res.status(200).json(subject);
//       }
//     }
//   } else {
//     return res.status(400).json({
//       error: "subject is not in userPurchaseList",
//     });
//   }
// });
