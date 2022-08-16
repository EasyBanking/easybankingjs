// import { Schema, model } from 'mongoose';
const mongoose = require("mongoose");



const TransactionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const TransactionsType = {
  INSTANT_PAYMENT: 'INSTANT_PAYMENT',
  TRANSFER: 'TRANSFER',
  WITHDRAWAL: 'WITHDRAWAL',
  DEPOSIT: 'DEPOSIT',
  RECEIVE: 'RECEIVE',
};

const TransactionSchema = new mongoose.Schema(
  {
    ReceiverId : {
      type: mongoose.Schema.Types.ObjectId , ref : 'User',
      required:true
    },
    SenderId : {
      type: mongoose.Schema.Types.ObjectId , ref : 'User',
      required:true
    },
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
    currency: {
      type: String,
      required: true,
    },
   
  },
  { versionKey: false }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
