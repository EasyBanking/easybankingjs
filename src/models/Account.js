const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { UrgentSchema } = require("./Urgent");

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
    addresse: {
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
      type: [UrgentSchema],
      default: [],
    },
  },
  { versionKey: false }
);

AccountSchema.pre("save", function (next) {
  if (this.isModified("atmPin")) {
    this.atmPin = bcrypt.hashSync(this.atmPin);
  }

  next();
});

const Account = model("Account", AccountSchema);

module.exports = { AccountSchema, Account };
