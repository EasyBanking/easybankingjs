const { Schema, model } = require("mongoose");

const LocationSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

const Location = model("Location", LocationSchema);

module.exports = { Location, LocationSchema };
