const mongodb = require("mongoose");
const { NotFound, BadRequest } = require("http-errors");
const { User } = require("../../models/User");
const { Account } = require("../../models/Account");
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
    } catch (err) {
      await trans.abortTransaction();
      console.log(err);
    } finally {
      await trans.endSession();
    }

    return true;
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
};

const validatePin = async (pin, accountId) => {
  const acc = await User.findOne({ account: objectId(accountId) })
    .populate("account", ["atmPin"])
    .orFail(new BadRequest("Invalid pin"));

  if (compareSync(pin, acc?.["account"]?.["atmPin"])) {
    return acc;
  }
};
