const router = require("express").Router();

// ===================== IMPORTS ======================================================

const { getUserById } = require("../controllers/user.controller");
const {
  createReceipt,
  paymentSuccess,
  subscribeFreeSubject,
  verifyReferralCode,
} = require("../controllers/payment.controller");
const { getSubjectById } = require("../controllers/subject.controller");
const {
  isSignIn,
  isAuthenticated,
  tokenVerify,
} = require("../controllers/auth.controller");

// ==================== PARAMS ========================================================

router.param("userId", getUserById);
router.param("subjectId", getSubjectById);

// ==================== ROUTES ========================================================

router.post(
  "/payment/create-receipt/:userId/:subjectId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  createReceipt
);

router.put(
  "/payment/payment-success-receipt/:userId/:subjectId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  paymentSuccess
);

router.put(
  "/subscribe-free-subject/:userId/:subjectId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  subscribeFreeSubject
);

router.get(
  "/payment/verify-referral-code/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  verifyReferralCode
);

module.exports = router;
