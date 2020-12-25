const User = require("../models/user.model");
const Subject = require("../models/subject.model");

// param function
exports.getUserById = async (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(404).json({              
                    error: "user not found"               
            });
        }

        // user found
        req.profile = user;
        next();
    })
}

// controller functions
exports.updateGoals = async(req, res) => {
    
    const goalId = req.body.goalId;  

    User.findById(req.profile._id).exec((err, user) => {
        if(err || !user) {
            return res.status(404).json({
                error: "user not found"
            });
        }

        // update the array in the database
        User.findOneAndUpdate(
            { _id: req.profile._id},
            { $set: {goalSelected: goalId, isGoalSelected: true }},
            { new: true}
        )
        .exec((err, user) => {
            if(err || !user) {
                return res.status(400).json({    
                    error: "error in updating goals list"
                });
            }
    
            return res.status(200).json({
                    message: "success",
                    goalSelected: user.goalSelected
            });
        })
    })
}

exports.getAllGoals = async (req, res) => {

    const arr = [
        {
            goalId: "1001", 
            goalName: "MPSC"  
        }
    ]

    return res.status(200).json({responseDTO: arr});
}

exports.getUserAccount = async (req, res) => {

    req.profile.password = undefined;
    return res.status(200).json(req.profile);
}


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