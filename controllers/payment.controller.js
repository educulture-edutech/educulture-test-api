const Payment = require("../models/payments.model");
const User = require("../models/user.model");
const dayjs = require("dayjs");
const { nanoid } = require("nanoid");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ===================== RAZORPAY INITIALIZATION =====================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ===================== CONTROLLERS =================================================

exports.createReceipt = async (req, res) => {
  const { price } = req.body;

  console.log("price: ", price);

  // create random referenceId for receipt
  const referenceId = await nanoid(10);
  console.log(referenceId);

  // razorpay
  const options = {
    amount: Number(price) * 100,
    currency: "INR",
    receipt: referenceId,
    // payment_capture: "1",
  };

  try {
    const order = await razorpay.orders.create(options);

    if (!order) {
      console.log("error in creating receipt at server");
      return res.status(400).json({
        error: "error in creating receipt at server",
      });
    } else {
      console.log("orderObj created by razorpay API: ", order);
      try {
        const payment = new Payment({
          user: req.profile._id,
          subject: req.subject._id,
          // paymentType: paymentType,
          orderId: order.id,
          referenceId: referenceId,
          subjectPrice: (order.amount / 100).toString(),
          cgst: "0",
          sgst: "0",
          totalAmount: (Number(price) + Number(0) + Number(0)).toString(),
          paymentStatus: order.status,
        });

        let savedPaymentReceipt = await payment.save();

        if (!savedPaymentReceipt) {
          return res.status(400).json({
            error: "error creating new payment receipt",
          });
        } else {
          console.log("receipt created successfully.");
          return res.status(200).json(savedPaymentReceipt);
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send({
          error: error,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

exports.paymentSuccess = async (req, res) => {
  const razorpay_order_id = req.body.razorpay_order_id;
  const razorpay_payment_id = req.body.razorpay_payment_id;
  const razorpay_signature = req.body.razorpay_signature;
  const referenceId = req.body.referenceId;
  const referralCode = req.body.referralCode;

  const generate_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_LIVE_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  console.log("generate signature : ", generate_signature);
  console.log("razorpay signature", razorpay_signature);

  if (generate_signature === razorpay_signature) {
    console.log("signatures matched -> payment verified.");

    // store everything in database
    const purchaseDate = dayjs();
    const expiryDate = purchaseDate.add(Number(req.subject.duration), "minute");
    // initiate purchase object to push in userPurchaseList
    const purchase = {
      subject_id: req.subject._id,
      subjectName: req.subject.subjectName,
      subjectId: req.subject.subjectId,
      instructor: req.subject.instructor,
      instructorId: req.subject.instructorId,
      subjectThumbnail: req.subject.subjectThumbnail,
      free: req.subject.free,
      isExpired: false,
      purchaseDate: purchaseDate.format(),
      expiryDate: expiryDate.format(),
      duration: req.subject.duration,
      orderId: req.body.razorpay_order_id,
      referralCode: req.body.referralCode,
    };

    // find the payment document by referenceId and update it
    try {
      let payment = await Payment.findOneAndUpdate(
        { referenceId: referenceId },
        {
          $set: {
            paymentId: razorpay_payment_id,
            paymentStatus: "success",
            referralCode: referralCode,
          },
        },
        { new: true }
      );

      if (!payment) {
        console.log("no orderId is matched in database");
        return res.status(404).json({
          error: "no orderId is matched in db",
        });
      } else {
        // push purchase object inside the userPurchaseList
        try {
          // update the user purchase list
          const user = await User.findOneAndUpdate(
            { _id: req.profile._id },
            { $push: { userPurchaseList: purchase } },
            { new: true }
          );

          if (!user) {
            console.log("user not found in db");
            return res.status(500).json({
              message: "error",
            });
          } else {
            console.log(
              "payment verified -> course added in account -> success."
            );
            return res.status(200).json({
              message: "success",
            });
          }
        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  } else {
    return res.status(400).json({
      error: "error in payment verification.",
    });
  }
};

exports.subscribeFreeSubject = async (req, res) => {
  if (req.subject.free == true) {
    const purchase = {
      subject_id: req.subject._id,
      subjectName: req.subject.subjectName,
      subjectId: req.subject.subjectId,
      instructor: req.subject.instructor,
      instructorId: req.subject.instructorId,
      subjectThumbnail: req.subject.thumbnail,
      free: req.subject.free,
    };

    // add this free subject in the userPurchaseList
    try {
      // update the user purchase list
      const user = await User.findOneAndUpdate(
        { _id: req.profile._id },
        { $push: { userPurchaseList: purchase } },
        { new: true }
      );

      if (!user) {
        console.log("user not found in db");
        return res.status(404).json({
          error: "user not found in DB",
        });
      } else {
        console.log("free subject added in userPurchaseList");
        return res.status(200).json({
          message: "success",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
};

// const dayjs = require("dayjs");

// const purchaseDate = dayjs();

// console.log(purchaseDate.format().toString());

// const expiryDate = purchaseDate.add(12, 'month');

// console.log(expiryDate.format().toString());

// const currentDate = dayjs();

// const date1 = dayjs(expiryDate.format());

// const datediff = date1.diff(purchaseDate, 'month');

// console.log(datediff
