const { Schema, model } = require("mongoose");
const { Notfication } = require("./Notfication");
const { User } = require("./User");

const PaymentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const PaymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        PaymentStatus.PENDING,
        PaymentStatus.APPROVED,
        PaymentStatus.REJECTED,
      ],
      default: PaymentStatus.PENDING,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    receivedAt: {
      type: Date,
      default: null,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      index: true,
      default: null,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Transaction",
    },
  },
  { versionKey: false }
);

PaymentSchema.post("save", async function (doc, next) {
  try {
    const n = new Notfication({
      content: `a qr payment has generated with ${doc.amount}egp at ${new Date(
        doc.datetime
      ).toLocaleString()}`,
    });

    await n.save();

    const usr = await User.findOneAndUpdate(
      {
        account: doc.sender,
      },
      {
        $push: {
          notfications: n._id,
        },
      }
    );

    next();
  } catch (er) {
    console.log(er);
    next(er);
  }
});

PaymentSchema.post("updateOne", async function (doc, next) {
  
  try {
    const populated = await doc.populate(["sender", "receiver"]);

    const n = new Notfication({
      content: `a qr payment has receved  with ${doc.amount}egp at ${new Date(
        doc.datetime
      ).toLocaleString()} to ${populated?.receiver?.firstName} ${
        populated?.receiver?.lastName
      }`,
    });

    const n2 = new Notfication({
      content: `a qr payment has receved with ${doc.amount}egp at ${new Date(
        doc.datetime
      ).toLocaleString()} from ${populated?.sender?.firstName} ${
        populated?.sender?.lastName
      }`,
    });

    await n.save();

    await n2.save();

    const usr1 = await User.findOneAndUpdate(
      {
        account: doc.sender,
      },
      {
        $push: {
          notfications: n._id,
        },
      }
    );

    const usr2 = await User.findOneAndUpdate(
      {
        account: doc.receiver,
      },
      {
        $push: {
          notfications: n2._id,
        },
      }
    );

    next();
  } catch (er) {
    console.log(er);
    next(er);
  }
});

const Payment = model("Payment", PaymentSchema);

module.exports = { Payment, PaymentStatus };
