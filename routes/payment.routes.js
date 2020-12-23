const router = require("express").Router();

const {getUserById} = require("../controllers/user.controller")
const {createReceipt, paymentSuccess} = require("../controllers/payment.controller");
const { getSubjectById } = require("../controllers/subject.controller");
const {isSignIn, isAuthenticated} = require("../controllers/auth.controller");

router.param("userId", getUserById);
router.param("subjectId", getSubjectById);

router.post("/payment/create-receipt/:userId/:subjectId", isSignIn, isAuthenticated, createReceipt);

router.put("/payment/payment-success-receipt/:userId/:subjectId", isSignIn, isAuthenticated, paymentSuccess);

module.exports = router;