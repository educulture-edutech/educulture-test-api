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

    birthdate: {
      type: String, 
      required: true, 
      trim: true,
    },

    goalSelected: {
      // type: Array,
      // trim: true
      type: String, 
      trim: true,
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
    },

    profileImage: {
      type: String, 
      trim: true, 
      default: "https://raw.githubusercontent.com/educulture-edutech/icons/main/user.png"
    },

    userPurchaseList: Array, 
      // default: [
      //   {
      //     subjectId: String,

      //     subjectName: String,

      //     thumbnail: String, 

      //     isExpired: {
      //       type: Boolean, 
      //       default: false
      //     },

      //     purchaseDate: String, 

      //     expiryDate: String,

      //     duration: String,

      //     referenceId: String,
      //   }
      // ]
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);