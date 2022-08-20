const { Schema, model } = require("mongoose");

const UrgentTypes = {
  INFO: "info",
  WARNING: "warning",
  DANGER: "danger",
  URGENT: "urgent",
};

const UrgentSchema = new Schema(
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
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(UrgentTypes),
      default: UrgentTypes.INFO,
    },
  },
  { versionKey: false }
);

const Urgent = model("Urgent", UrgentSchema);

module.exports = { UrgentSchema, Urgent };
