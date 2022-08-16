const { model, Schema, Types, default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const Roles = {
  ADMIN: "SYSTEM_ADMIN",
  USER: "USER",
  CS: "CUSTOMER_SERVICE",
  SALES: "SALES",
};

const userSecuritySchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    answer: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
  },
  { _id: false, versionKey: false }
);

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 20,
    },
    role: {
      type: String,
      default: Roles.USER,
    },
    profileImg: {
      type: String,
    },
    security: {
      type: userSecuritySchema,
      required: true,
    },
    isAcitive: {
      type: Boolean,
      default: false,
    },
    notfications: {
      type: [Types.ObjectId],
      default: [],
      ref: "Notfication",
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { versionKey: false }
);

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  
    Roles,
    User
  
};
