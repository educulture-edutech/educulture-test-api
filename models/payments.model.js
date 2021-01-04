const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const paymentSchema = new mongoose.Schema(
  {
    // used

    user: {
      type: ObjectId,
      ref: "User",
    },

    // used

    subject: {
      type: ObjectId,
      ref: "Subject",
      trim: true,
    },

    // used

    paymentType: {
      type: String,
      trim: true,
    },

    // used

    orderId: {
      type: String,
      trim: true,
    },

    // used

    referenceId: {
      type: String,
      trim: true,
    },

    paymentId: {
      type: String,
      trim: true,
    },

    subjectPrice: {
      type: String,
      trim: true,
    },

    cgst: {
      type: String,
      trim: true,
    },

    sgst: {
      type: String,
      trim: true,
    },

    totalAmount: {
      type: String,
      trim: true,
    },

    paymentStatus: {
      type: String,
      default: "uninitiated",
    },

    referralCode: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
