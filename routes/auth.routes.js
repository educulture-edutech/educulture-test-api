const router = require("express").Router();

// ============================= IMPORTS ==========================================

const {
  checkNumber,
  registerUser,
  sendOTP,
  verifyOTP,
  loginUser,
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  resetPassword,
  intializeResetPassword,
} = require("../controllers/auth.controller");
const { getUserById } = require("../controllers/user.controller");

// ============================== PARAMS ===========================================
router.param("userId", getUserById);

// check the mobile number is present in the database or not
router.get("/account/check-number", checkNumber);

router.post("/account/register", registerUser);

router.get(
  "/account/sendOTP/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  sendOTP
);

router.get(
  "/account/verifyOTP/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  verifyOTP
);

router.post("/account/login", loginUser);

router.put(
  "/account/reset-password/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  resetPassword
);

router.get("/account/initialize-reset-password", intializeResetPassword);

module.exports = router;
