const { Urgent } = require("../../models/Urgent");
const { Account } = require("../../models/Account");
const { User } = require("../../models/User");

module.exports = {
  async getAll(req, res) {
    res.json({
      urgents: await Urgent.find(),
    });
  },

  async find(req, res) {
    const { id } = req.params;
    res.json({
      urgents: await Urgent.findById(id),
    });
  },

  async delete(req, res) {
    const { id } = req.params;

    const ac = await Account.findByIdAndUpdate(id, {
      $pull: {
        urgents: ur._id,
      },
    });

    res.json({
      urgents: await Urgent.findByIdAndDelete(id),
    });
  },

  async create(req, res) {
    const { content, type } = req.body;
    const { id } = req.params;

    const ur = await Urgent.create({
      content,
      type,
      viewed: false,
    });

    const ac = await Account.findByIdAndUpdate(id, {
      $push: {
        urgents: ur._id,
      },
    });

    res.json({
      urgent: ur,
    });
  },

  async update(req, res) {
    const { content, type, viewed, viewedAt } = req.body;
    const { id } = req.params;

    const ur = await Urgent.findByIdAndUpdate(id, {
      content,
      type,
      viewed,
      viewedAt,
    });

    res.json({
      urgent: ur,
    });
  },
};
