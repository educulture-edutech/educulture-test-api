const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    subject_id: {
      type: String,
      trim: true,
    },

    subjectId: {
      type: String,
      trim: true,
    },

    subjectName: {
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
