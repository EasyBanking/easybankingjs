const { Schema, model } = require("mongoose");

const tokenType = {
  emailConfirmation: "emailConfirmation",
  passwordReset: "passwordReset",
};

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(tokenType),
    },
  },
  { versionKey: false }
);

const Token = model("Tokens", TokenSchema);

module.exports = { Token, TokenSchema };
