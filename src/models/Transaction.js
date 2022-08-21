const { Schema, Types, model } = require("mongoose");
const { Notfication } = require("./Notfication");
const { User } = require("./User");

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

TransactionSchema.post("save", async function (doc, next) {
  try {
    const populated = await doc.populate(["sender", "receiver"]);

    const n = new Notfication({
      content: `a transaction has send with ${doc.amount} egp at ${new Date(
        doc.datetime
      ).toLocaleString()} to ${populated?.receiver?.firstName} ${
        populated?.receiver?.lastName
      }`,
    });

    const n2 = new Notfication({
      content: `a transaction has receved with ${doc.amount} egp at ${new Date(
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

const Transaction = model("Transaction", TransactionSchema);

module.exports = {
  TransactionSchema,
  Transaction,
  TransactionsType,
  TransactionStatus,
};
