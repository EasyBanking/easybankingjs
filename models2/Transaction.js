const { Schema, Types, model } = require("mongoose");

const TransactionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const TransactionsType = {
  TRANSFER: "TRANSFER",
  RECEIVE: "RECEIVE",
};

const TransactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: [...Object.values(TransactionsType)],
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: [
        TransactionStatus.PENDING,
        TransactionStatus.APPROVED,
        TransactionStatus.REJECTED,
      ],
      default: TransactionStatus.PENDING,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    sender: {
      type: Types.ObjectId,
      required: true,
      ref: "Account",
    },

    receiver: {
      type: Types.ObjectId,
      required: false,
      ref: "Account",
    },
  },
  { versionKey: false }
);

const Transaction = model("Transaction", TransactionSchema);

module.exports = {
  TransactionSchema,
  Transaction,
  TransactionsType,
  TransactionStatus,
};
