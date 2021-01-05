const User = require("../models/user.model");
const Subject = require("../models/subject.model");
const dayjs = require("dayjs");
// param function
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

exports.getAllSubjects = async (req, res) => {
  const goalId = req.profile.goalSelected;

  // try {
  // 	const subjects = await Subject.find({goalId: goalId});
  // 	if(!subjects) {
  // 		return res.status(404).json({
  //             error: "no subject found for goal selected by user"
  //         })
  // 	}

  // 	else {
  // 		return res.status(200).json(subjects);
  // 	}
  // } catch (error) {
  // 	console.log(error);
  // 	return res.status(500).send(error)
  // }

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

exports.getSubjectData = async (req, res) => {
  let flag = 0;
  const userPurchaseList = req.profile.userPurchaseList;
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
      try {
        // subject validity expired ERR 403 only expose two first chapter
        const subject = await Subject.findOne({
          _id: req.subject._id,
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
          return res.status(200).json(newSubjectDTO);
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    } else {
      console.log("checking if subject is in userPurchaseList");
      console.log("subject_id", userPurchaseList[0].subject_id);
      console.log("_id", req.subject._id);
      for (let i = 0; i < userPurchaseList.length; i++) {
        if (
          userPurchaseList[i].subject_id.toString() ===
          req.subject._id.toString()
        ) {
          console.log("entered");
          const currentDate = dayjs();
          if (currentDate.isAfter(dayjs(userPurchaseList[i].expiryDate))) {
            userPurchaseList[i].isExpired = true;
            flag = 1;
            break;
          }
          //
          else {
            // expiry date is not crossed. return subject data
            try {
              const subject = await Subject.findOne({
                _id: userPurchaseList[i].subject_id,
              });
              if (!subject) {
                return res.status(404).json({
                  error: "subject not found in the database",
                });
              } else {
                console.log("SUBJECT FOUND: ".subject);
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
          // subject is not in userPurchaseList ERR 403 only expose first chapter
          try {
            // subject validity expired ERR 403 only expose two first chapter
            const subject = await Subject.findOne({
              _id: req.subject._id,
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
              return res.status(200).json(newSubjectDTO);
            }
          } catch (error) {
            console.log(error);
            return res.status(500).send(error);
          }
        }
      }

      if (flag !== 0) {
        // something is changed in userPurchaseList
        // so update the userPurchaseList

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
          // still returns the subject data
          try {
            // subject validity expired ERR 403 only expose two first chapter
            const subject = await Subject.findOne({
              _id: req.subject._id,
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
              return res.status(200).json(newSubjectDTO);
            }
          } catch (error) {
            console.log(error);
            return res.status(500).send(error);
          }
        }
      }
    }
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
//     // currentDate crossed expiry date

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
