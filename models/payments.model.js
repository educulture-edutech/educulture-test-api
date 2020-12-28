const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },

    subject: {
      type: ObjectId,
      ref: "Subject",
      trim: true,
    },

    paymentType: {
      type: String,
      trim: true,
    },

    orderId: {
      type: String,
      trim: true,
    },

    referenceId: {
      type: String,
      trim: true,
    },

    paymentId: {
      type: String,
      trim: true,
    },

    transactionId: {
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
      default: "uninitiated", // initiated, processing, success, fail.
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
