const express = require("express");
const router = require("express").Router();

const { checkNumber, registerUser } = require("../controllers/auth");

// check the mobile number is present in the database or not
router.post("/account/verification/check-number", checkNumber);

router.post("/account/register", registerUser);

module.exports = router;
