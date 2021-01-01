const User = require("../models/user.model");
const Subject = require("../models/subject.model");

// ========================= PARAMS =====================================

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

// ========================= CONTROLLERS ================================

exports.updateGoals = async (req, res) => {
  const goalId = req.body.goalId;

  if ((req.profile.goalId = goalId && req.profile.isGoalSelected == true)) {
    User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: { goalSelected: null, isGoalSelected: false } },
      { new: true }
    ).exec((error, user) => {
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
    return res.status(200).json(req.profile);
  } else {
    return res.status(404).json({
      error: "user not found.",
    });
  }
};

exports.getUserPurchaseList = async (req, res) => {
  if (req.profile) {
    return res.status(200).json(req.profile.userPurchaseList);
  } else {
    return res.status(404).json({
      error: "user not found.",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  console.log("visited");

  try {
    const user = await User.deleteOne({ _id: req.profile._id });
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
