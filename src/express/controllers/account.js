const mongodb = require("mongoose");
const { NotFound, BadRequest } = require("http-errors");
const { User } = require("../../models/User");
const notficationEmitter = require("../../helpers/NotficationBuilder");
const { Account } = require("../../models/Account");
const { events } = require("../../helpers/constants");
const { Payment } = require("../../models/Payment");
const {
  Transaction,
  TransactionsType,
  TransactionStatus,
} = require("../../models/Transaction");
const objectId = (id) => new mongodb.Types.ObjectId(id);
const { compareSync, hashSync } = require("bcryptjs");

module.exports = {
  async createAccount(req, res) {
    const { firstName, lastName, dateOfBirth, addresse, atmPin, nationalId } =
      req.body;

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

      await User.findByIdAndUpdate(req.user._id, {
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
    const { amount, receiverId, atmPin } = req.body;

    const trans = await mongodb.startSession();

    trans.startTransaction();

    try {
      const sender = await Account.findById(objectId(req.user.account)).orFail(
        new NotFound("Sender account not found")
      );

      if (!(await validatePin(atmPin, sender.id))) {
        throw new BadRequest("pin is not valid");
      }

      if (sender.balance < amount) {
        throw new BadRequest("Insufficient balance");
      }

      if (sender.status != "active") {
        throw new BadRequest("Sender account is not active");
      }

      const receiver = await Account.findById(objectId(receiverId)).orFail(
        new NotFound("receiver is not round")
      );

      if (sender.currency !== receiver.currency) {
        throw new BadRequest("Currency mismatch");
      }

      if (receiver.status != "active") {
        throw new BadRequest("Receiver account is not active");
      }

      const senderBalance = sender.balance - amount;
      const receiverBalance = receiver.balance + amount;

      const transaction_ = await Transaction.create({
        amount,
        type: TransactionsType.TRANSFER,
        sender: req.user._id,
        receiver: receiver._id,
        status: TransactionStatus.APPROVED,
        datetime: new Date(),
      });
      const senderAccount = await Account.findByIdAndUpdate(
        objectId(sender.id),
        {
          balance: senderBalance,
          $push: transaction_._id,
        }
      ).orFail(new NotFound());

      const receiverAccount = await Account.findByIdAndUpdate(
        objectId(receiverId),
        {
          balance: receiverBalance,
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
      throw err;
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

    let session = await mongodb.startSession();
    session.startTransaction();

    try {
      const account = await Account.findOne({ id: req.user.account }).orFail(
        new NotFound("account not found to update !")
      );

      if (!compareSync(atmPin, account.atmPin)) {
        account.atmPin = hashSync(atmPin);
      }

      account.firstName = firstName;
      account.lastName = lastName;
      account.nationalId = nationalId;
      account.dateOfBirth = dateOfBirth;
      account.addresse = addresse;

      await account.save();
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
