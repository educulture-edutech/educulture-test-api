const router = require("express").Router();

const {getUserById, updateGoals, getAllGoals, getUserAccount} = require("../controllers/user.controller");
const { isSignIn, isAuthenticated } = require("../controllers/auth.controller");

// params
router.param("userId", getUserById);

// routes
router.put("/user/update-goal/:userId", isSignIn, isAuthenticated, updateGoals);

router.get("/user/get-goals", getAllGoals);

router.get("/user/get-account/:userId", isSignIn, isAuthenticated, getUserAccount);

// router.delete("/user/delete-account/:userId", isSignIn, isAuthenticated, deleteAccount);

module.exports = router;