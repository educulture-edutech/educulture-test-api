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
const { isSignIn, isAuthenticated } = require("../controllers/auth.controller");

// ==================== PARAMS ========================================================

router.param("userId", getUserById);
router.param("subjectId", getSubjectById);

// ==================== ROUTES ========================================================

router.post(
  "/payment/create-receipt/:userId/:subjectId",
  isSignIn,
  isAuthenticated,
  createReceipt
);

router.put(
  "/payment/payment-success-receipt/:userId/:subjectId",
  isSignIn,
  isAuthenticated,
  paymentSuccess
);

router.put(
  "/subscribe-free-subject/:userId/:subjectId",
  isSignIn,
  isAuthenticated,
  subscribeFreeSubject
);

router.get(
  "/payment/verify-referral-code/:userId",
  isSignIn,
  isAuthenticated,
  verifyReferralCode
);

module.exports = router;
