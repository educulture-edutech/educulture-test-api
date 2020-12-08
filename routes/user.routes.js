const router = require("express").Router();

const {getUserById, updateGoals, getAllGoals} = require("../controllers/user.controller");
const { isSignIn, isAuthenticated } = require("../controllers/auth.controller");

// params
router.param("userId", getUserById);

// routes
router.put("/user/update-goal/:userId", isSignIn, isAuthenticated, updateGoals);

router.get("/user/get-goals", getAllGoals);


module.exports = router;