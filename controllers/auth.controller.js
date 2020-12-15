const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const fetch = require("node-fetch");

exports.checkNumber = async (req, res) => {
  
    const mobile =  req.query.mobile;

    if(mobile.length === 10) {
      // find the mobile number in DB
      User.findOne({ mobile }, (err, user) => {
        if (err || !user) {
          return res.status(404).json({
            mobile: mobile,
            isAccountRegistered: false, 
            isAccountVerified: false,
            isGoalSelected: false,
          });
        }

        // else mobile number is found
        return res.status(200).json({
          mobile: user.mobile,
          isAccountRegistered: user.isAccountRegistered,
          isAccountVerified: user.isAccountVerified,
          isGoalSelected: user.isGoalSelected,
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
    isAccountRegistered: true, 
  });

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "error in saving information in DB",
      });
    }

    // after saving sign jwt token and return it
    let token = jwt.sign({_id: user._id}, process.env.SECRET);

    const {_id, firstName, lastName, email, mobile, goalSelected, role, gender, isAccountRegistered, isGoalSelected, isAccountVerified, profileImage } = user;

    return res.status(200).json({
      token, 
      user: {_id, firstName, lastName, email, mobile, goalSelected, role, gender, isAccountRegistered, isGoalSelected, isAccountVerified, profileImage }
    })
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
      
      // update the isAccountVerified field 
      User.findOneAndUpdate(
        { mobile: mobile},
        { $set: {isAccountVerified: true }},
        { new: true}
      )
      .exec((err, user) => {
        if(err || !user) {
          return res.status(400).json({
              error: "error in updating isAccountVerified flag"
          })    
        }
        
        return res.status(200).send(json);
      }); 
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
        let token = jwt.sign({_id: user._id}, process.env.SECRET, {expiresIn: "1d"});

        const {_id, firstName, lastName, email, mobile, goalSelected, role, gender, isAccountRegistered, isGoalSelected, isAccountVerified, profileImage } = user;

        return res.status(200).json({
          token, 
          user: {_id, firstName, lastName, email, mobile, goalSelected, role, gender, isAccountRegistered, isGoalSelected, isAccountVerified, profileImage }
        })
      }

      else {
        return res.status(401).json({
          error: "password does not match with mobile number."
        })
      }
  });
}

// auth middlewares

exports.isSignIn = expressjwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ['HS256'],
});

exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  
  if(!checker) {
    return res.status(403).json({
      error: "access denied."
    })
  }

  next();
}

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "not admin. access denied.",
    });
  }
  next();
};

