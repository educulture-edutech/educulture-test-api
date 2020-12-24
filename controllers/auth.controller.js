const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const fetch = require("node-fetch");

exports.checkNumber = async (req, res) => {
  
    const mobile =  req.query.mobile;

    if(typeof(mobile.length) !== "undefined" && mobile.length === 10) {
      // find the mobile number in DB
      User.findOne({ mobile }, (err, user) => {
        if (err || !user) {
          return res.status(200).json({
            responseDTO: {
              mobile: mobile,
              isAccountRegistered: false, 
              isAccountVerified: false,
              isGoalSelected: false,
            }  
          });
        }

        // else mobile number is found
        return res.status(200).json({
          responseDTO: {
            mobile: user.mobile,
            isAccountRegistered: user.isAccountRegistered,
            isAccountVerified: user.isAccountVerified,
            isGoalSelected: user.isGoalSelected,
          }
        });
      });
    }

    else {
      return res.status(400).json({
        responseDTO: {
          error: "enter valid mobile number"
        }
      });
    }
};

exports.registerUser = async (req, res) => {

  console.log(req.body);

  const firstName = req.body.firstName.toString();
  const lastName = req.body.lastName.toString();
  const password = req.body.password.toString();
  const email = req.body.email.toString();
  const mobile = req.body.mobile.toString();
  const gender = req.body.gender.toString();
  const birthdate = req.body.birthdate.toString();

  // const {firstName, lastName, email, password, mobile, gender, birthdate} = req.body;

  // console.log(req.body);
  // console.log(req.body.registrationDTO);

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
    birthdate: birthdate,
    isAccountRegistered: true, 
  });

  console.log(user);

  user.save((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        responseDTO: {
          error: "error in saving information in DB",
        }
      });
    }

    // after saving sign jwt token and return it
    let token = jwt.sign({_id: user._id}, process.env.SECRET);

    const {_id, firstName, lastName, email, mobile, birthdate, goalSelected, role, gender, isAccountRegistered, isGoalSelected, isAccountVerified, profileImage } = user;

    return res.status(200).json({
        responseDTO: {
          _id, 
          token, 
          firstName, 
          lastName, 
          email, 
          mobile, 
          birthdate,
          goalSelected, 
          role, 
          gender, 
          isAccountRegistered, 
          isGoalSelected, 
          isAccountVerified, 
          profileImage 
        }
    })
  });
};

exports.sendOTP = async (req, res) => {
  
  const mobile = req.query.mobile;

  if(typeof(mobile) !== "undefined" && mobile.length === 10) {
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
        return res.status(200).json({
          responseDTO: json
        });
      });
  }

  else {
    return res.status(400).json({
      responseDTO: {
        error: "enter valid mobile number"
      }
    });
  }
};

exports.verifyOTP = async(req, res) => {
  
  const otp = req.query.otp;
  const mobile = req.query.mobile;
  
  if(typeof(otp.length) !== "undefined" && typeof(mobile.length) !== "undefined" && mobile.length == 10) {
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
            return res.status(404).json({
              responseDTO: {
                error: "error in updating isAccountVerified flag"
              }
            })    
          }
          
          return res.status(200).json({responseDTO: json});
        }); 
      });
  }
  
  else {
    return res.status(400).json({
      responseDTO: {
        error: "enter valid otp and mobile number"
      }
    });
  }
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
      if(err || !user) {
        return res.status(404).json({
          error: "error in finding mobile number."
        })
      }

      if(user.password === encry_password) {
        // if password is correct generate token
        let token = jwt.sign({_id: user._id}, process.env.SECRET);

        const {_id, firstName, lastName, email, mobile, birthdate, goalSelected, role, gender, isAccountRegistered, isGoalSelected, isAccountVerified, profileImage } = user;

        return res.status(200).json({
          responseDTO: {
            _id, 
            token, 
            firstName, 
            lastName, 
            email, 
            mobile, 
            birthdate,
            goalSelected, 
            role, 
            gender, 
            isAccountRegistered, 
            isGoalSelected, 
            isAccountVerified, 
            profileImage 
          }
        })
      }

      else {
        return res.status(401).json({
          responseDTO: {
            error: "password does not match with mobile number."
          }
        })
      }
  });
}

exports.resetPassword = async (req, res) => {
  
  const {mobile, newPassword} = req.body;

  const encry_password = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(newPassword)
    .digest("hex");

  try {
    // update the user purchase list
    const user = await User.findOneAndUpdate({_id: req.profile._id}, 
      {$set: {password: encry_password} }, 
      {new: true});

    if(!user) {
        return res.status(404).json({
          responseDTO: {
            error: "user not found"
          }
        })
    }

    else {
        return res.status(200).json({
          responseDTO: {
            message: "success"
          } 
        })
    }
    
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }

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
      responseDTO: {
        error: "access denied."
      }
    })
  }

  next();
}

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      responseDTO: {
        error: "not admin. access denied.",
      }
    });
  }
  next();
};

exports.isTokenExpired = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1].toString();
    jwt.verify(token, process.env.SECRET, (err, verifiedJwt) => {
      if(err){
        console.log(err);
        let newToken = jwt.sign({_id: req.profile._id}, process.env.SECRET, {expiresIn: "1d"});
        req.headers.authorization = `Bearer ${newToken}`;
        console.log("newToken: ", req.headers.authorization);
        next();
      }else{
        next();
      }
    })
}