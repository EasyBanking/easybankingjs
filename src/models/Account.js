const { Schema, model, Types } = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("./User");

const accountStatus = {
  active: "active",
  inactive: "inactive",
  blocked: "blocked",
  temporaryInactive: "temporaryInactive",
  pending: "pending",
};

const AccountSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(accountStatus),
      default: accountStatus.pending,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    atmPin: {
      type: String,
      required: true,
    },
    urgents: {
      type: [Types.ObjectId],
      default: [],
      ref: "Urgent",
    },
    schedules: {
      type: [Types.ObjectId],
      ref: "Schedule",
      default: [],
    },
  },
  { versionKey: false }
);

AccountSchema.virtual("user").get(async function () {
  return await User.findOne({ account: this._id });
});

AccountSchema.pre("save", function (next) {
  if (this.isModified("atmPin")) {
    this.atmPin = bcrypt.hashSync(this.atmPin);
  }

  next();
});

const Account = model("Account", AccountSchema);

module.exports = { AccountSchema, Account };
