const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const fetch = require("node-fetch");

exports.checkNumber = async (req, res) => {
  
    const mobile = req.query.mobile;

    if(mobile.length === 10) {
      // find the mobile number in DB
      User.findOne({ mobile }, (err, user) => {
        if (err || !user) {
          return res.status(404).json({
            mobile: mobile,
            isMobileVerified: false,
            isEmailRegistered: false,
          });
        }

        // else mobile number is found
        return res.status(200).json({
          mobile: user.mobile,
          isMobileVerified: user.isMobileVerified,
          isEmailRegistered: user.isEmailRegistered,
        });
      });
    }

    else {
      return res.status(400).json({
        error: "enter valid mobile number"
      });
    }
};

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, mobile, gender } = req.body;

  const encry_password = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(password)
    .digest("hex");

  let user = new User({
    firstName: firstName,
    lastName: lastName,
    password: encry_password,
    email: email,
    mobile: mobile,
    gender: gender,
    isEmailRegistered: true,
  });

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "error in saving information in DB",
      });
    }

    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isEmailRegistered: user.isEmailRegistered,
      mobile: user.mobile,
      isMobileVerified: user.isMobileVerified,
      gender: user.gender,
      role: user.role,
    });
  });
};

exports.sendOTP = async (req, res) => {
  
  const mobile = req.query.mobile;

  if(mobile.length === 10) {
    fetch(
      `https://api.msg91.com/api/v5/otp?extra_param={"COMPANY_NAME":"Educulture", "Param2":"Value2", "Param3": "Value3"}&authkey=345746ARD5Rwyrwq9R5f998e59P1&template_id=5f9e5df3c34bf71c99465912&mobile=91${mobile}&invisible=1`,
      {
        method: "GET",
        port: null,
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        return res.status(200).send(json);
      });
  }

  else {
    return res.status(400).json({
      error: "enter valid mobile number"
    });
  }
};

exports.verifyOTP = async(req, res) => {
  
  const otp = req.query.otp;
  const mobile = req.query.mobile;
  
  fetch(
    `https://api.msg91.com/api/v5/otp/verify?mobile=91${mobile}&otp=${otp}&authkey=345746ARD5Rwyrwq9R5f998e59P1`,
    {
      method: "POST",
      port: null,
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      return res.status(200).send(json);
    });
}

exports.loginUser = async(req, res) => {

  const {mobile, password} = req.body;

  const encry_password = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(password)
    .digest("hex");

  User.findOne({mobile}, (err, user) => {
      // mobile number will always be in DB. so no error
      // map password
      if(user.password === encry_password) {
        // if password is correct generate token
        let token = jwt.sign({_id: user._id}, process.env.SECRET);

        const {_id, firstName, lastName, email, isEmailRegistered, mobile, isMobileVerified, role, gender } = user;

        return res.status(200).json({
          token, 
          user: {_id, firstName, lastName, email, isEmailRegistered, mobile, isMobileVerified, role, gender}
        })
      }

      else {
        return res.status(401).json({
          error: "password does not match with mobile number."
        })
      }
  });
}