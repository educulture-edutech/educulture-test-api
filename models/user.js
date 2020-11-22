const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      maxlength: 15,
      trim: true,
      required: true,
    },

    lastName: {
      type: String,
      maxlength: 15,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    isEmailRegistered: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    lastotp: {
      type: String, 
      trim: true
    }, 

    lastotptime: {
      type: String, 
      trim: true
    },

    role: {
      type: Number,
      default: 0,
    },

    gender: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6,
    },

    lastLoginDate: {
      type: String, 
      trim: true,
    }, 

    lastLoginIP: {
      type: String, 
      trim: true
    },

  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
