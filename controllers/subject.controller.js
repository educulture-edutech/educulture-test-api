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

exports.getSubjectBySubjectId = async (req, res) => {
  const subjectId = req.query.subjectId;

  const flag = 0;
  const userPurchaseList = req.profile.userPurchaseList;

  console.log("userPurchaseList ->", userPurchaseList);

  userPurchaseList.map((subject, index) => {
    if (subject.subjectId === subjectId) {
      if (subject.isExpired == true) {
        return res.status(403).json({
          error: "subject validity expired.",
        });
      }

      const currentDate = dayjs();
      const expiryDate = dayjs(subject.expiryDate);

      if (currentDate.isBefore(dayjs(expiryDate)) === false) {
        // subscription is invalid
        flag = 1;
        subject.isExpired = true;
      }
    }
  });

  if (flag !== 0) {
    // means something is changed, set the new purchaseList
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: { userPurchaseList: userPurchaseList } },
      { new: true }
    );

    if (!user) {
      console.log("user not found in db");
      return res.status(500).json({
        error: "error in updating the userPurchaseList",
      });
    } else {
      console.log("userPurchaseList updated -> subject validity expired");
      return res.status(403).json({
        error: "subject validity expired",
      });
    }
  } else {
    try {
      const subject = await Subject.findOne({
        subjectId: subjectId,
      });

      if (!subject) {
        return res.status(404).json({
          error: "no subject found for this subjectId",
        });
      } else {
        return res.status(200).json(subject);
      }
    } catch (error) {
      // exception, maybe db is broken when query data
      console.log(error);
      return res.status(500).send(error);
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

// check if expiry date has crossed or not

// const purchaseDate = dayjs();

// console.log(purchaseDate.format().toString());

// const expiryDate = purchaseDate.add(12, 'month');

// console.log(expiryDate.format().toString());
