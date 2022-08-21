const { Schema, model, Types } = require("mongoose");

const schedules = ["teller", "customer serivce", "other"];

const schema = new Schema({
  type: {
    type: String,
    enum: schedules,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["done", "pending", "rescheduled", "missed"],
  },
});

const Schedule = model("Schedule", schema);

module.exports = {
  Schedule,
};
