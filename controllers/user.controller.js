const user = require("../models/user");
const User = require("../models/user");

// param function
exports.getUserById = async (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(404).json({
                error: "user not found"
            })
        }

        // user found
        req.profile = user;
        next();
    })
}

// controller functions
exports.updateGoal = async (req, res) => {
    let goalId = req.body.goalId;

    User.findOneAndUpdate(
        { _id: req.profile._id},
        { $set: {goalSelected: goalId, isGoalSelected: true }},
        { new: true}
    )
    .exec((err, user) => {
        if(err || !user) {
            return res.status(404).json({
                error: "user not found."
            })
        }

        return res.status(200).json({
            message: "success",
        });
        
        // const {_id, firstName, lastName, email, mobile, isGoalSelected, goalSelected,  role, gender } = user;

        // return res.status(200).json({
        //     _id: _id, 
        //     firstName: firstName,
        //     lastName: lastName, 
        //     email: email, 
        //     mobile: mobile, 
        //     isGoalSelected: isGoalSelected, 
        //     goalSelected: goalSelected,
        //     role: role, 
        //     gender: gender,
        // });
    })
}