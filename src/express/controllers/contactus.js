const { ContactUs } = require("../../models/ContactUs");

module.exports = {
  async getAll(req, res) {
    try {
      const contactus = await ContactUs.find();
      res.status(200).json(contactus);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //get one by id
  async getOneById(req, res) {
    try {
      const id = req.params.id;
      const message = await ContactUs.findById(id);
      res.status(200).json(message);
    } catch (err) {
      res.status(200).json(err);
    }
  },
  //delete contact us by id
  async deleteContactUs(req, res) {
    try {
      const id = req.params.id;
      const contactus = await ContactUs.findByIdAndDelete(id);
      res.status(200).json(contactus);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
