const router = require("express").Router();

const { checkNumber, registerUser, sendOTP, verifyOTP, loginUser, isTokenExpired } = require("../controllers/auth.controller");
const { route } = require("./user.routes");

// check the mobile number is present in the database or not
router.get("/account/check-number", checkNumber);

router.post("/account/register", registerUser);

router.get("/account/sendOTP", sendOTP);

router.get("/account/verifyOTP", verifyOTP);

router.post("/account/login", loginUser);

module.exports = router;
