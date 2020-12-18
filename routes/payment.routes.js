const router = require("express").Router();

const {getUserById} = require("../controllers/user.controller")
const {createReceipt, paymentSuccess} = require("../controllers/payment.controller");
const { getSubjectById } = require("../controllers/subject.controller");

router.param("userId", getUserById);
router.param("subjectId", getSubjectById);

router.post("/payment/create-receipt/:userId/:subjectId", createReceipt);

router.post("/payment/payment-success-receipt/:userId/:subjectId", paymentSuccess);

module.exports = router;