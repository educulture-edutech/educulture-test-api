const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");

exports.checkNumber = (req, res) => {
  const mobile = req.body.mobile;

  // find the mobile number in DB
  User.findOne({ mobile }, (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        mobile: mobile,
        flag: "false",
      });
    }

    // else mobile number is found
    return res.status(200).json({
      mobile: "mobile",
      flag: "true",
    });
  });
};

exports.registerUser = (req, res) => {
  const { mobile, firstName, lastName, password, email, gender } = req.body;

  const encry_password = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(password)
    .digest("hex");

  let user = new User({
    mobile: mobile,
    firstName: firstName,
    lastName: lastName,
    password: encry_password,
    email: email,
    gender: gender,
  });

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "error in saving information in DB",
      });
    }

    return res.status(200).json({
      mobile: user.mobile,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      isVerified: user.isVerified,
    });
  });
};
