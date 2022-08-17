const { Schema, model } = require("mongoose");

const ContactSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

const Contact = model("Contact", ContactSchema);

module.exports = { Contact, ContactSchema };
