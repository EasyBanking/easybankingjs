const { Schema, model } = require("mongoose");

const notficationSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
    },
  },
  { versionKey: false }
);

const Notfication = model("Notfication", notficationSchema);

module.exports = { notficationSchema, Notfication };
