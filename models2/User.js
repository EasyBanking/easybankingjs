const { model, Schema, Types } = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { notficationSchema } = require("./Notfication");
const uploader = require("../helpers/uploader");
const Roles = {
  ADMIN: "ADMIN",
  USER: "USER",
  CS: "SERVICE",
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
      minlength: 2,
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
      maxlength: 64,
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
      type: [notficationSchema],
      default: [],
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

UserSchema.post("deleteOne", { document: true }, async function () {
  const profileImgPath = path.join(process.cwd(), this.profileImg);
  await uploader.delete(this.id);
});

const User = model("User", UserSchema);

module.exports = {
  Roles,
  User,
};
