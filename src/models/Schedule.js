const { Schema, model, Types } = require("mongoose");

const schedules = ["teller", "customer serivce", "other"];

const schema = new Schema({
  type: {
    type: String,
    enum: schedules,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  location_id: {
    type: Types.ObjectId,
    ref: "Location",
    required: true,
  },
});

const Schedule = model("Schedule", schema);

module.exports = {
  Schedule,
};
