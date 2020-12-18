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

    userPurchaseList: {
      type: Array, 
      default: [
        {
          subjectId: {
            type: String, 
            trim: true
          },

          subjectName: {
            type: String, 
            trim: true,
          },

          thumbnail: {
            type: String, 
            trim: true,
          },
          
          isExpired: {
            type: Boolean, 
            trim: true,
            default: false
          },

          purchaseDate: {
            type: Date, 
            trim: true, 
          }, 

          expiryDate: {
            type: Date, 
            trim: true, 
          }, 

          duration: {
            type: String, 
            trim: true,
          }, 

          referenceId: {
            type: String, 
            trim: true
          }
        }
      ]
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);