const mongodb = require("mongoose");
const { NotFound, BadRequest } = require("http-errors");
const { User } = require("../../models/User");
const notficationEmitter = require("../../helpers/NotficationBuilder");
const { Account } = require("../../models/Account");
const { events } = require("./constants");
const { Payment } = require("../../models/Payment");
const objectId = (id) => new mongodb.Types.ObjectId(id);

module.exports = {
  async createAccount(req, res) {
    const {
      firstName,
      lastName,
      dateOfBirth,
      addresse,
      atmPin,
      nationalId,
      userId,
    } = req.body;

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const account = await Account.create({
        atmPin,
        firstName,
        lastName,
        nationalId,
        dateOfBirth,
        addresse,
      });

      await User.findByIdAndUpdate(objectId(userId), {
        account: account._id,
      });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.json({
      message:
        "Account created successfully, and its under review by the customer service.",
    });
  },

  async transferMoney(req, res) {
    const { amount, senderId, receiverId, currency, atmPin } = req.body;

    const trans = await mongodb.startSession();

    trans.startTransaction();

    try {
      const sender = await Account.findById(objectId(senderId)).orFail(
        new NotFound()
      );

      if (!(await validatePin(atmPin, senderId))) {
        throw new BadRequest("pin is not valid");
      }

      if (!sender) {
        throw new BadRequest("Sender account not found");
      }

      if (sender.balance < amount) {
        throw new BadRequest("Insufficient balance");
      }

      if (sender.status != "active") {
        throw new BadRequest("Sender account is not active");
      }

      const receiver = await Account.findById(objectId(receiverId)).orFail(
        new NotFound()
      );

      if (!receiver) {
        throw new BadRequest("Receiver account not found");
      }

      if (sender.currency !== receiver.currency) {
        throw new BadRequest("Currency mismatch");
      }

      if (receiver.status != "active") {
        throw new BadRequest("Receiver account is not active");
      }

      const senderBalance = sender.balance - amount;
      const receiverBalance = receiver.balance + amount;

      const senderAccount = await Account.findByIdAndUpdate(
        objectId(senderId),
        {
          balance: senderBalance,
          $push: {
            transactions: {
              amount,
              type: TransactionsType.TRANSFER,
              currency: currency,
              transactionable: objectId(senderId),
              status: TransactionStatus.APPROVED,
              datetime: new Date(),
            },
          },
        }
      ).orFail(new NotFound());

      const receiverAccount = await Account.findByIdAndUpdate(
        objectId(receiverId),
        {
          balance: receiverBalance,
          $push: {
            transactions: {
              amount,
              type: TransactionsType.RECEIVE,
              currency: currency,
              transactionable: objectId(receiverId),
              status: TransactionStatus.APPROVED,
              datetime: new Date(),
            },
          },
        }
      ).orFail(new NotFound());

      await trans.commitTransaction();

      notficationEmitter.emit(events.TRANSFER_MONEY_NOTFICATION, {
        user: sender,
        amount,
      });

      notficationEmitter.emit(events.RECEIVE_MONEY_NOTFICATION, {
        user: receiver,
        amount,
      });
    } catch (err) {
      await trans.abortTransaction();
      console.log(err);
    } finally {
      await trans.endSession();
    }
    res.json({
      message: "successfully transfered money",
    });
  },

  async accountSearch(req, res) {
    const { username } = req.query;

    const user = await User.find({
      username: {
        $regex: username || "",
        $options: "i",
      },
    })
      .select(["username", "account"])
      .populate("account", ["_id"])
      .exec();

    res.json({
      user,
    });
  },

  async updateAccount(req, res) {
    const { firstName, lastName, dateOfBirth, addresse, atmPin, nationalId } =
      req.body;

    const { accountId } = req.params;

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const account = await Account.findOneAndUpdate(accountId, {
        atmPin,
        firstName,
        lastName,
        nationalId,
        dateOfBirth,
        addresse,
      });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.json({
      message: "account has been updated Successfully.",
    });
  },

  async pay(req, res) {
    const { atmPin, accountId, amount } = req.body;

    const trans = await mongodb.startSession();
    trans.startTransaction();
    try {
      if (!(await validatePin(atmPin, accountId))) {
        throw new BadRequest("pin is not valid");
      }

      const account = await Account.findById(objectId(accountId)).orFail(
        new NotFound()
      );

      if (!account) {
        throw new BadRequest("Account not found");
      }

      if (account.status != "active") {
        throw new BadRequest("Account is not active");
      }

      if (account.balance < amount) {
        throw new BadRequest("Insufficient balance");
      }

      if (account.instantPayMaxAmount < amount) {
        throw new BadRequest(
          "Your amount is greater than your instant pay max amount"
        );
      }

      const token = randomBytes(8).toString("hex");

      const instantPay = await Payment.create({
        amount,
        currency: account.currency,
        token: token,
        expireAt: new Date(Date.now() + 1000 * 60 * 60 * 1), // only one hour
        senderId: accountId,
      });

      const accountUpdate = await Account.findByIdAndUpdate(
        objectId(accountId),
        {
          $push: {
            transactions: {
              amount,
              type: TransactionsType.INSTANT_PAYMENT,
              currency: account.currency,
              status: TransactionStatus.PENDING,
              datetime: new Date(),
            },
          },
        }
      ).orFail(new NotFound());

      await trans.commitTransaction();

      notficationEmitter.emit(events.INSTANT_PAY_GENERATION_NOTFICATION, {
        user: accountId,
        amount,
      });

      return { token, expireAt: instantPay.expireAt, id: instantPay._id };
    } catch (err) {
      await trans.abortTransaction();
      throw err;
    } finally {
      await trans.endSession();
    }
  },

  async readPayment(req, res) {
    const { token } = req.query;
    const { atmPin, accountId } = req.body;

    await validatePin(atmPin, receiverId);

    const trans = await mongodb.startSession();

    trans.startTransaction();

    try {
      const payment = await Payment.findOne({
        token,
      })
        .orFail(new BadRequest("token is not valid"))
        .exec();

      if (payment?.receivedAt) {
        throw new BadRequest("payment already received");
      }

      // if payment is expired

      if (payment.expireAt.getTime() < Date.now()) {
        throw new BadRequest("Payment is expired");
      }

      // if sender is have the balance right now

      const sender = await Account.findById(payment.senderId).orFail(
        new BadRequest("Account not found")
      );

      if (sender.balance < payment.amount) {
        throw new BadRequest("Insufficient balance");
      }

      const receiver = await Account.findById(objectId(receiverId)).orFail(
        new BadRequest("Account not found")
      );

      if (receiver.status != "active") {
        throw new BadRequest("Account is not active");
      }

      if (sender.currency !== receiver.currency) {
        throw new BadRequest("Currency mismatch");
      }

      const senderBalance = sender.balance - payment.amount;

      const senderAccount = await Account.findOneAndUpdate(
        {
          _id: objectId(payment.senderId),
          "transactions.transactionable": payment._id,
        },
        {
          balance: senderBalance,
          $set: {
            "transactions.$.status": TransactionStatus.APPROVED,
          },
        }
      ).orFail(new NotFound());

      const receiverAccount = await Account.findByIdAndUpdate(
        objectId(receiverId),
        {
          balance: receiver.balance + payment.amount,
          $push: {
            transactions: {
              amount: payment.amount,
              type: TransactionsType.RECEIVE,
              currency: sender.currency,
              transactionable: senderAccount._id,
              status: TransactionStatus.APPROVED,
              datetime: new Date(),
            },
          },
        }
      );

      payment.status = PaymentStatus.APPROVED;
      payment.receivedAt = new Date();
      await payment.save();

      notficationEmitter.emit(events.INSTANT_PAY_RECEVEING_NOTFICATION, {
        user: receiverAccount,
        amount,
      });

      await trans.commitTransaction();

      res.json({
        message: "payment done successfully.",
      });
    } catch (err) {
      await trans.abortTransaction();
      throw err;
    } finally {
      await trans.endSession();
    }
  },
};

const validatePin = async (pin, accountId) => {
  const acc = await User.findOne({ account: objectId(accountId) })
    .populate("account", ["atmPin"])
    .orFail(new BadRequest("Invalid pin"));

  if (compareSync(pin, acc?.["account"]?.["atmPin"])) {
    return acc;
  }
};
