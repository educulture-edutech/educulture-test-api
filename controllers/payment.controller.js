const Payment = require("../models/payments.model");
const User = require("../models/user.model");
const dayjs = require("dayjs");
const { nanoid } = require("nanoid");

exports.createReceipt = async (req, res) => {
  const { paymentType } = req.body;

  // create random referenceId for receipt
  const referenceId = await nanoid(10);
  console.log(referenceId);

  // initiate payment receipt and save into payment model
  try {
    const payment = new Payment({
      user: req.profile._id,
      subject: req.subject._id,
      paymentType: paymentType,
      referenceId: referenceId,
      subjectPrice: req.subject.price,
      cgst: 0,
      sgst: 0,
      totalAmount: (
        Number(req.subject.price) +
        Number(0) +
        Number(0)
      ).toString(),
      paymentStatus: "initiated",
    });

    let savedPaymentReceipt = await payment.save();

    if (!savedPaymentReceipt) {
      return res.status(400).json({
        error: "error creating new payment receipt",
      });
    } else {
      return res.status(200).json(savedPaymentReceipt);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

exports.paymentSuccess = async (req, res) => {
  const { paymentId, transactionId, paymentType, referenceId } = req.body;

  const purchaseDate = dayjs();
  const expiryDate = purchaseDate.add(Number(req.subject.duration), "month");

  // initiate purchase object to push in userPurchaseList
  const purchase = {
    subjectName: req.subject.subjectName,
    subjectId: req.subject.subjectId,
    instructor: req.subject.instructor,
    instructorId: req.subject.instructorId,
    thumbnail: req.subject.thumbnail,
    isExpired: false,
    purchaseDate: purchaseDate.format(),
    expiryDate: expiryDate.format(),
    duration: req.subject.duration,
    referenceId: referenceId,
  };

  // find the payment document by referenceId and update it
  try {
    let payment = await Payment.findOneAndUpdate(
      { referenceId: referenceId, paymentType: paymentType },
      {
        $set: {
          paymentId: paymentId,
          transactionId: transactionId,
          paymentStatus: "success",
        },
      },
      { new: true }
    );

    if (!payment) {
      return res.status(400).json({
        error: "no referenceId and paymentType is matched in db",
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
          return res.status(500).json({
            message: "error",
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
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
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

// console.log(datediff)
