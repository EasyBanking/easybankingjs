const { User } = require("../../models/User");
const Mongoose = require("mongoose");
const objectId = (id) => new Mongoose.Types.ObjectId(id);
const { NotFound } = require("http-errors");

module.exports = {
  async getAll(req, res) {
    const notfications = await User.find().select(["_id", "notfications"]);

    res.json({
      data: notfications,
    });
  },

  async delete(req, res) {
    const { id } = req.params;
    const usr = await User.findOne({
      "notfications._id": objectId(id),
    }).orFail(new NotFound("Notfication not found"));

    usr.notfications.pull({
      _id: objectId(id),
    });

    await usr.save();

    res.json({
      message: "succsessfully delted a notfication",
    });
  },
};
