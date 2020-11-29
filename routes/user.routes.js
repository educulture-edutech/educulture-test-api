const { route } = require("./auth.routes");

const User = require("../models/user");
const router = require("express").Router();

const {getUserById, updateGoal} = require("../controllers/user.controller");
const { isSignIn, isAuthenticated } = require("../controllers/auth.controller");

// params
router.param("userId", getUserById);

// routes
router.put("/user/update-goal/:userId", isSignIn, isAuthenticated, updateGoal);

module.exports = router;