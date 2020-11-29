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

    goalSelected: {
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

    isAccountRegistered: {
      type: Boolean, 
      default: false,
      trim: true,
    },

    isAccountVerified: {
      type: Boolean,
      default: false, 
      trim: true,
    },

    isGoalSelected: {
      type: Boolean, 
      default: false
    }
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

/*

goalSelected: 1000 - default, 1001 - mpsc, 1002 - 11th, 1003 - 12th


*/