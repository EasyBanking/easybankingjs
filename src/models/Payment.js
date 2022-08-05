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
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      index: true,
      default: null,
    },
  },
  { versionKey: false }
);

const Payment = model("Payment", PaymentSchema);

module.exports = { Payment, PaymentStatus };
