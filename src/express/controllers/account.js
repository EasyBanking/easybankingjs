const mongodb = require("mongoose");
const { NotFound, BadRequest } = require("http-errors");
const { User } = require("../../models/User");
const notficationEmitter = require("../../helpers/NotficationBuilder");
const { Account } = require("../../models/Account");
const { events } = require("../../helpers/constants");
const { Payment, PaymentStatus } = require("../../models/Payment");
const {
  Transaction,
  TransactionsType,
  TransactionStatus,
} = require("../../models/Transaction");
const objectId = (id) => new mongodb.Types.ObjectId(id);
const { randomBytes } = require("crypto");
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
    const { atmPin, amount } = req.body;

    const trans = await mongodb.startSession();
    trans.startTransaction();
    try {
      if (!(await validatePin(atmPin, req.user.account))) {
        throw new BadRequest("pin is not valid");
      }

      const account = await Account.findById(objectId(req.user.account)).orFail(
        new NotFound("Account not found")
      );

      if (account.status != "active") {
        throw new BadRequest("Account is not active");
      }

      if (account.balance < amount) {
        throw new BadRequest("Insufficient balance");
      }

      const token = randomBytes(8).toString("hex");

      const transaction_ = await Transaction.create({
        amount,
        type: TransactionsType.TRANSFER,
        status: TransactionStatus.PENDING,
        datetime: new Date(),
        sender: account,
      });

      const instantPay = await Payment.create({
        amount,
        token: token,
        expireAt: new Date(Date.now() + 1000 * 60 * 60 * 1), // only one hour
        sender: req.user.account,
        transaction: transaction_._id,
      });

      const accountUpdate = await Account.findByIdAndUpdate(
        objectId(req.user.account),
        {
          $push: {
            transactions: transaction_._id,
          },
        }
      ).orFail(new NotFound());

      await trans.commitTransaction();

      notficationEmitter.emit(events.INSTANT_PAY_GENERATION_NOTFICATION, {
        user: req.user.account,
        amount,
      });

      res.json({ token, expireAt: instantPay.expireAt, id: instantPay._id });
    } catch (err) {
      await trans.abortTransaction();
      throw err;
    } finally {
      await trans.endSession();
    }
  },

  async readPayment(req, res) {
    const { token } = req.params;
    const { atmPin } = req.body;

    const trans = await mongodb.startSession();

    trans.startTransaction();

    try {
      await validatePin(atmPin, req.user.account);

      // shoudl contains a transactionId
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

      const sender = await Account.findById(payment.sender).orFail(
        new BadRequest("Account not found")
      );

      if (sender.balance < payment.amount) {
        throw new BadRequest("Insufficient balance");
      }

      const receiver = await Account.findById(
        objectId(req.user.account)
      ).orFail(new BadRequest("Account not found"));

      if (receiver.status != "active") {
        throw new BadRequest("Account is not active");
      }

      if (sender.currency !== receiver.currency) {
        throw new BadRequest("Currency mismatch");
      }

      const senderBalance = sender.balance - payment.amount;

      const senderAccount = await Account.findOneAndUpdate(
        {
          _id: objectId(payment.sender),
        },
        {
          balance: senderBalance,
        }
      );

      const transaction_ = await Transaction.findOneAndUpdate(
        {
          id: payment.transaction,
        },
        {
          status: TransactionStatus.APPROVED,
        }
      ).orFail(new NotFound("transaction is not valid"));

      const receiverAccount = await Account.findByIdAndUpdate(
        objectId(req.user.account),
        {
          balance: receiver.balance + payment.amount,
        }
      );

      payment.status = PaymentStatus.APPROVED;
      payment.receivedAt = new Date();
      await payment.save();

      notficationEmitter.emit(events.INSTANT_PAY_RECEVEING_NOTFICATION, {
        user: receiverAccount,
        amount: payment.amount,
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

  async getAll(req, res) {
    res.json({
      data: await Account.find(),
    });
  },

  async find(req, res) {
    const { id } = req.params;

    res.json({
      data: await Account.findOne({
        _id: objectId(id),
      }),
    });
  },

  async delete(req, res) {
    const { id } = req.params;
    res.json({
      data: await Account.findByIdAndDelete(objectId(id)).orFail(
        new NotFound("account not found")
      ),
    });
  },

  async alter(req, res) {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      dateOfBirth,
      addresse,
      atmPin,
      nationalId,
      balance,
      status,
    } = req.body;

    const trans = await mongodb.startSession();

    trans.startTransaction();

    try {
      const updated = await Account.findOne({
        _id: objectId(id),
      });

      if (!compareSync(atmPin, updated.atmPin)) {
        updated.atmPin = atmPin;
      }

      updated.firstName = firstName;
      updated.lastName = lastName;
      updated.dateOfBirth = dateOfBirth;
      updated.addresse = addresse;
      updated.nationalId = nationalId;
      updated.status = status;
      updated.balance = balance;

      await updated.save();

      await trans.commitTransaction();

      res.json({
        message: "account has been updated successfully",
        data: updated,
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
