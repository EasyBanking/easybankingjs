const { Contact } = require("../../models/contact");

module.exports = {
  async getAll(req, res) {
    try {
      const contactus = await Contact.find();
      res.status(200).json(contactus);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //get one by id
  async getOneById(req, res) {
    try {
      const id = req.params.id;
      const message = await Contact.findById(id);
      res.status(200).json(message);
    } catch (err) {
      res.status(200).json(err);
    }
  },
  //delete contact us by id
  async deleteContactUs(req, res) {
    try {
      const id = req.params.id;
      const contactus = await Contact.findByIdAndDelete(id);
      res.status(200).json(contactus);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async createContact(req, res) {
    const { message, subject, email } = req.body;

    await Contact.create({
      message,
      subject,
      email,
    });

    res.json({
      message: "succesfully received a contact message",
    });
  },

  async updateContact(req, res) {
    const { message, subject, email } = req.body;
    const { id } = req.params;

    await Contact.findByIdAndUpdate(id, {
      message,
      subject,
      email,
    });

    res.json({
      message: "succesfully received a contact message",
    });
  },
};
