const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const fetch = require("node-fetch");

// ========================== CONTROLLERS ======================================

exports.checkNumber = async (req, res) => {
  const mobile = req.query.mobile;

  if (typeof mobile.length !== "undefined" && mobile.length === 10) {
    // find the mobile number in DB
    User.findOne({ mobile }, (err, user) => {
      if (err || !user) {
        return res.status(200).json({
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
  } else {
    return res.status(400).json({
      error: "enter valid mobile number",
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
  let deviceId;

  // const {firstName, lastName, email, password, mobile, gender, birthdate} = req.body;

  // console.log(req.body);
  // console.log(req.body.registrationDTO);
  if (typeof req.body.deviceId === "undefined") {
    deviceId = "";
  } else {
    deviceId = req.body.deviceId.toString();
  }

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
    deviceId: deviceId,
    allowDeviceIdChange: false,
    birthdate: birthdate,
    isAccountRegistered: true,
  });

  console.log(user);

  user.save((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "error in saving information in DB",
      });
    }

    // after saving sign jwt token and return it
    let token = jwt.sign({ _id: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });

    const {
      _id,
      firstName,
      lastName,
      email,
      mobile,
      birthdate,
      goalSelected,
      role,
      gender,
      deviceId,
      isAccountRegistered,
      isGoalSelected,
      isAccountVerified,
      profileImage,
    } = user;

    return res.status(200).json({
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
      deviceId,
      isAccountRegistered,
      isGoalSelected,
      isAccountVerified,
      profileImage,
    });
  });
};

exports.sendOTP = async (req, res) => {
  const mobile = req.query.mobile;

  if (typeof mobile !== "undefined" && mobile.length === 10) {
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
          message: json.request_id,
          type: json.type,
        });
      });
  } else {
    return res.status(400).json({
      error: "enter valid mobile number",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  const otp = req.query.otp;
  const mobile = req.query.mobile;

  if (
    typeof otp.length !== "undefined" &&
    typeof mobile.length !== "undefined" &&
    mobile.length == 10
  ) {
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
          { mobile: mobile },
          { $set: { isAccountVerified: true } },
          { new: true }
        ).exec((err, user) => {
          if (err || !user) {
            return res.status(404).json({
              error: "error in updating isAccountVerified flag",
            });
          }

          return res.status(200).json(json);
        });
      });
  } else {
    return res.status(400).json({
      error: "enter valid otp and mobile number",
    });
  }
};

exports.loginUser = async (req, res) => {
  const { mobile, password } = req.body;

  const encry_password = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(password)
    .digest("hex");

  // if deviceId = "" -> user still has old version of app so give login access
  if (typeof req.body.deviceId === "undefined") {
    // only check mobile and password
    try {
      const user = await User.findOne({ mobile: mobile });
      if (!user) {
        return res.status(404).json({
          error: "error in finding mobile number.",
        });
      }

      // else user found check if password is matching or not
      if (user.password === encry_password) {
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
          expiresIn: "120s",
        });

        const {
          _id,
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
          profileImage,
        } = user;

        return res.status(200).json({
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
          profileImage,
        });
      }

      // password did not match
      else {
        return res.status(401).json({
          error: "password does not match with mobile number.",
        });
      }
    } catch (error) {
      console.log(error);
      req.status(500).send(error);
    }
  } else {
    // device id has come through client means user has updated version
    const deviceId = req.body.deviceId.toString(); // extract the deviceId

    try {
      const user = await User.findOne({ mobile: mobile });
      if (!user) {
        return res.status(404).json({
          error: "error in finding mobile number.",
        });
      } else {
        // check if admin has given some priviliges to this user or not
        if (user.allowDeviceIdChange === true) {
          // user can change the device id
          changeDeviceId = await User.findOneAndUpdate(
            { mobile: mobile },
            { $set: { deviceId: deviceId, allowDeviceIdChange: false } },
            { new: true }
          );

          if (!changeDeviceId) {
            return res.status(404).json({
              error: "You have changed your device. Kindly contact us.",
            });
          } else {
            // now check for password
            if (user.password === encry_password) {
              const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
                expiresIn: "120s",
              });

              const {
                _id,
                firstName,
                lastName,
                email,
                mobile,
                birthdate,
                goalSelected,
                role,
                gender,
                deviceId,
                isAccountRegistered,
                isGoalSelected,
                isAccountVerified,
                profileImage,
              } = user;

              return res.status(200).json({
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
                deviceId,
                isAccountRegistered,
                isGoalSelected,
                isAccountVerified,
                profileImage,
              });
            } else {
              return res.status(401).json({
                error: "password does not match with mobile number.",
              });
            }
          }
        }

        // no -> admin has not given such priviliges
        // normal login : check password -> check deviceId
        // if password is not mathing -> 401
        // if yes check if deviceId is matching or not
        // finally issues the token
        else {
          if (user.password === encry_password) {
            // password matched
            if (user.deviceId === deviceId) {
              // deviceId matched
              // issue token
              const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
                expiresIn: "120s",
              });

              const {
                _id,
                firstName,
                lastName,
                email,
                mobile,
                birthdate,
                goalSelected,
                role,
                gender,
                deviceId,
                isAccountRegistered,
                isGoalSelected,
                isAccountVerified,
                profileImage,
              } = user;

              return res.status(200).json({
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
                deviceId,
                isAccountRegistered,
                isGoalSelected,
                isAccountVerified,
                profileImage,
              });
            } else {
              // no device not matched
              return res.status(400).json({
                error:
                  "Do not try to login other than your registered device. If you have changed your device, Kindly contact us.",
              });
            }
          } else {
            return res.status(401).json({
              error: "password does not match with mobile number.",
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      req.status(500).send(error);
    }
  }
};

exports.resetPassword = async (req, res) => {
  const { mobile, newPassword } = req.body;

  const encry_password = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(newPassword)
    .digest("hex");

  try {
    // update the user purchase list
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: { password: encry_password } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    } else {
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

exports.intializeResetPassword = async (req, res) => {
  // get mobile number as input
  // find if mobile number is present in the DB
  // if not error please signup
  // if yes then mobile number is present in the DB send user data back to client and send otp

  const mobile = req.query.mobile;

  if (typeof mobile !== "undefined" && mobile.length == 10) {
    try {
      const user = await User.findOne({ mobile: mobile });

      if (!user) {
        return res.status(404).json({
          error: "user not found in DB",
        });
      } else {
        const userId = user._id;
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
          expiresIn: "120s",
        });

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
              _id: userId,
              token: token,
              message: json.request_id,
              type: json.type,
            });
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
};

exports.getNewToken = async (req, res) => {
  const tokenDataFromClient = req.body.tokenDataFromClient.toString();
  const mobile = req.body.mobile.toString();

  try {
    const userHashFromDB = await User.findOne({ _id: req.profile._id }).select([
      "userHash",
    ]);

    if (!userHashFromDB)
      return res.status(400).json({
        error: "couldn't create new token",
      });

    if (userHashFromDB.userHash == "") {
      // userHash is empty; directly create new token and send
      let token = jwt.sign({ _id: userHashFromDB._id }, process.env.SECRET, {
        expiresIn: "120s",
      });

      let newTokenData = token.toString().split(".")[2];
      let userHash = await generateUserHash(newTokenData, mobile);

      // update this in database
      const updateUserHash = await User.findOneAndUpdate(
        { _id: req.profile._id },
        { $set: { userHash: userHash } },
        { new: true }
      );

      if (!updateUserHash) {
        return res.status(400).json({
          error: "couldn't create new token",
        });
      }

      // return new token
      return res.status(200).json({
        token: token,
      });
    }

    // userHash is already present in the database
    else {
      let userHash = await generateUserHash(
        tokenDataFromClient.toString().split(".")[2],
        mobile
      );

      // check if this userHash matches with userHash present in DB
      if (userHashFromDB.userHash == userHash) {
        // generate new token
        let token = jwt.sign({ _id: userHashFromDB._id }, process.env.SECRET, {
          expiresIn: "120s",
        });

        let newTokenData = token.toString().split(".")[2];

        // generate userHash from this new token
        userHash = await generateUserHash(newTokenData, mobile);

        // update the new userHash in DB
        const updateUserHash = await User.findOneAndUpdate(
          { _id: req.profile._id },
          { $set: { userHash: userHash } },
          { new: true }
        );

        if (!updateUserHash) {
          return res.status(400).json({
            error: "couldn't create new token",
          });
        }

        return res.status(200).json({
          token: token,
        });
      } else {
        return res.status(400).json({
          error: "couldn't create new token",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.logout = async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $set: { userHash: "" } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        error: "couldn't find this user in DB",
      });
    }

    return res.status(200).json({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// ================================= MIDDLEWARES ================================================

exports.isSignIn = expressjwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!checker) {
    return res.status(403).json({
      error: "access denied.",
    });
  }

  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "not admin. access denied.",
    });
  }
  next();
};

exports.tokenVerify = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(406).end();
    }

    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
      if (err) {
        return res.status(406).end();
      }

      next();
    });
  } catch (error) {
    return res.status(406).end();
  }
};

// ================================= HELPER FUNCTIONS ==========================================

const generateUserHash = async (tokenData, mobile) => {
  let hashDataString = tokenData.concat(mobile);
  let userHash = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(hashDataString)
    .digest("hex");

  console.log("new userHash: ", userHash);

  return userHash;
};

// exports.isTokenExpired = async (req, res, next) => {
//   const token = req.headers.authorization.split(" ")[1].toString();
//   jwt.verify(token, process.env.SECRET, (err, decodedTokenInfo) => {
//     if (err) {
//       console.log(err);
//       return res.status(133);
//       // let newToken = jwt.sign({ _id: req.profile._id }, process.env.SECRET, {
//       //   expiresIn: "1d",
//       // });
//       // req.headers.authorization = `Bearer ${newToken}`;
//       // console.log("newToken: ", req.headers.authorization);
//       // next();
//     } else {
//       next();
//     }
//   });
// };

// User.findOne({ mobile }, (err, user) => {
//   // mobile number will always be in DB. so no error
//   // map password
//   if (err || !user) {
//     return res.status(404).json({
//       error: "error in finding mobile number.",
//     });
//   }

//   if (user.password === encry_password) {
//     // if password is correct generate token
//     const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
//       expiresIn: "1d",
//     });

//     const {
//       _id,
//       firstName,
//       lastName,
//       email,
//       mobile,
//       birthdate,
//       goalSelected,
//       role,
//       gender,
//       isAccountRegistered,
//       isGoalSelected,
//       isAccountVerified,
//       profileImage,
//     } = user;

//     return res.status(200).json({
//       _id,
//       token,
//       firstName,
//       lastName,
//       email,
//       mobile,
//       birthdate,
//       goalSelected,
//       role,
//       gender,
//       isAccountRegistered,
//       isGoalSelected,
//       isAccountVerified,
//       profileImage,
//     });
//   } else {
//     return res.status(401).json({
//       error: "password does not match with mobile number.",
//     });
//   }
// });

// try {
//   const user = await User.findOne({ mobile: mobile });
//   if (!user) {
//     return res.status(404).json({
//       error: "error in finding mobile number.",
//     });
//   } else {
//     if (user.allowDeviceIdChange === true) {
//       // user can change the device id
//       changeDeviceId = await User.findOneAndUpdate(
//         { mobile: mobile },
//         { $set: { deviceId: deviceId, allowDeviceIdChange: false } },
//         { new: true }
//       );

//       if (!changeDeviceId) {
//         return res.status(404).json({
//           error: "You have changed your device. Kindly contact us.",
//         });
//       } else {
//         // now check for password
//         if (user.password === encry_password) {
//           const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
//             expiresIn: "1d",
//           });

//           const {
//             _id,
//             firstName,
//             lastName,
//             email,
//             mobile,
//             birthdate,
//             goalSelected,
//             role,
//             gender,
//             deviceId,
//             isAccountRegistered,
//             isGoalSelected,
//             isAccountVerified,
//             profileImage,
//           } = user;

//           return res.status(200).json({
//             _id,
//             token,
//             firstName,
//             lastName,
//             email,
//             mobile,
//             birthdate,
//             goalSelected,
//             role,
//             gender,
//             deviceId,
//             isAccountRegistered,
//             isGoalSelected,
//             isAccountVerified,
//             profileImage,
//           });
//         } else {
//           return res.status(401).json({
//             error: "password does not match with mobile number.",
//           });
//         }
//       }
//     }
//     // check if IMEI is matching with deviceId
//     if (user.deviceId === deviceId) {
//       // device id is matched now check if password is matching
//       if (user.password === encry_password) {
//         const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
//           expiresIn: "1d",
//         });

//         const {
//           _id,
//           firstName,
//           lastName,
//           email,
//           mobile,
//           birthdate,
//           goalSelected,
//           role,
//           gender,
//           isAccountRegistered,
//           isGoalSelected,
//           isAccountVerified,
//           profileImage,
//         } = user;

//         return res.status(200).json({
//           _id,
//           token,
//           firstName,
//           lastName,
//           email,
//           mobile,
//           birthdate,
//           goalSelected,
//           role,
//           gender,
//           isAccountRegistered,
//           isGoalSelected,
//           isAccountVerified,
//           profileImage,
//         });
//       } else {
//         return res.status(401).json({
//           error: "password does not match with mobile number.",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         error:
//           "Do not try to login other than your registered device. If you have changed your device, Kindly contact us.",
//       });
//     }
//   }
// } catch (error) {
//   console.log(error);
//   res.status(500).send(error);
// }
