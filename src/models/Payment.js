const { Schema, model } = require("mongoose");

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

const Payment = model("Payment", PaymentSchema);

module.exports = { Payment, PaymentStatus };
