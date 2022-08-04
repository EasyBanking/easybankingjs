const { Schema } = require("mongoose");

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
    viewedAt: {
      type: Date,
    },
  },
  { versionKey: false }
);

module.exports = { notficationSchema };
