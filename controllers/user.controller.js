const User = require("../models/user.model");
const Subject = require("../models/subject.model");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

// ========================= PARAM FUNCTIONS =====================================

exports.getUserById = async (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    // user found
    req.profile = user;
    next();
  });
};

// ========================= CONTROLLERS ==========================================

exports.updateGoals = async (req, res) => {
  const goalId = req.body.goalId;

  if ((req.profile.goalId = goalId && req.profile.isGoalSelected == true)) {
    User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: { goalSelected: null, isGoalSelected: false } },
      { new: true }
    ).exec((error, user) => {
      if (error || !user) {
        return res.status(400).json({
          error: "error in updating goals list",
        });
      }

      console.log(user.goalSelected);

      return res.status(200).json({
        message: "success",
        type: user.goalSelected, // goalSelected: user.goalSelected
      });
    });
  } else {
    User.findById(req.profile._id).exec((err, user) => {
      if (err || !user) {
        return res.status(404).json({
          error: "user not found",
        });
      }

      // update the array in the database
      User.findOneAndUpdate(
        { _id: req.profile._id },
        { $set: { goalSelected: goalId, isGoalSelected: true } },
        { new: true }
      ).exec((err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: "error in updating goals list",
          });
        }

        console.log(user.goalSelected);

        return res.status(200).json({
          message: "success",
          type: user.goalSelected, // goalSelected: user.goalSelected
        });
      });
    });
  }
};

exports.getAllGoals = async (req, res) => {
  const arr = [
    {
      goalId: "1001",
      goalName: "MPSC",
    },
  ];

  return res.status(200).json(arr);
};

exports.getUserAccount = async (req, res) => {
  if (req.profile) {
    req.profile.password = undefined;
    // also we need to send only those subjects where isExpired not true so we need
    // to update the userPurchaseList
    const purchaseList = req.profile.userPurchaseList;
    let newPurchaseList = [];

    purchaseList.map((purchaseObj) => {
      if (purchaseObj.isExpired !== true) {
        newPurchaseList.push(purchaseObj);
      }
    });

    req.profile.userPurchaseList = newPurchaseList;

    // hence req.profile is updated
    return res.status(200).json(req.profile);
  } else {
    return res.status(404).json({
      error: "user not found.",
    });
  }
};

exports.getUserPurchaseList = async (req, res) => {
  if (req.profile) {
    // we need to only send those courses whose isExpired is false
    const purchaseList = req.profile.userPurchaseList;

    let newPurchaseList = [];

    purchaseList.map((purchaseObj) => {
      if (purchaseObj.isExpired !== true) {
        newPurchaseList.push(purchaseObj);
      }
    });

    return res.status(200).json(newPurchaseList);
  } else {
    return res.status(404).json({
      error: "user not found.",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  console.log("visited");
  const mobile = req.query.mobile;

  try {
    const user = await User.deleteOne({ mobile: mobile });
    if (!user) {
      return res.status(404).json({
        error: "user not found in DB",
      });
    } else {
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

exports.clearUserPurchaseList = async (req, res) => {
  const userPurchaseList = [];
  const userId = req.body.userId;

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { userPurchaseList: userPurchaseList } },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      error: "user not found",
    });
  } else {
    return res.status(200).json(user);
  }
};

exports.pushSubjectToUserPurchaseList = async (req, res) => {
  // create object to push in userPurchaseList

  const userIdToPush = req.body.userIdToPush;

  const purchaseDate = dayjs().tz("Asia/Kolkata");
  const expiryDate = purchaseDate.add(Number(req.subject.duration), "minute");

  const obj = {
    subjectId: req.subject.subjectId,
    subject_id: req.subject._id,
    subjectName: req.subject.subjectName,
    instructor: req.subject.instructor,
    instructorId: req.subject.instructorId,
    subjectThumbnail: req.subject.instructorId,
    free: req.subject.free,
    isExpired: false,
    purchaseDate: purchaseDate.format(),
    expiryDate: expiryDate.format(),
    duration: req.subject.duration,
    orderId: "NA",
    referralCode: "EDCLTR",
    backendPush: true,
  };

  // now just push this object in userPurchaseList
  try {
    // update the user purchase list
    const user = await User.findOneAndUpdate(
      { _id: userIdToPush },
      { $push: { userPurchaseList: obj } },
      { new: true }
    );

    if (!user) {
      console.log("user not found in db");
      return res.status(500).json({
        message: "error",
      });
    } else {
      console.log("payment verified -> course added in account -> success.");
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

// =========================================== END ====================================================

// exports.getAllSubjects = async (req, res) => {
//     const goalId = req.profile.goalSelected;

//     Subject.find({goalSelected: goalId}).exec((err, subjects) => {
//         if(err || !subjects) {
//             return res.status(404).json({
//                 error: "no subject found for goal selected by user"
//             })
//         }

//         return subjects;
//     })
// }

// exports.updateGoals = async(req, res) => {
//     const {goalArray} = req.body;

//     if(goalArray.length <= 0) {
//         return res.status(400).json({
//             error: "goalArray.length >=1"
//         })
//     }

//     else {
//         User.findById(req.profile._id).exec((err, user) => {
//             if(err || !user) {
//                 return res.status(404).json({
//                     error: "user not found"
//                 })
//             }

//             // update the array in the database
//             User.findOneAndUpdate(
//                 { _id: req.profile._id},
//                 { $set: {goalSelected: goalArray, isGoalSelected: true }},
//                 { new: true}
//             )
//             .exec((err, user) => {
//                 if(err || !user) {
//                     return res.status(404).json({
//                         error: "error in updating goals list"
//                     })
//                 }

//                 return res.status(200).json({
//                     message: "success",
//                     goalArray: user.goalSelected
//                 });
//             })

//         })
//     }
// }
