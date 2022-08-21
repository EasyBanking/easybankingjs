const questions = require("../../models/Questions.json");
const faqs = require("../../models/faqs.json");
const { Location } = require("../../models/Location");
const { Contact } = require("../../models/contact");

module.exports = {
  async createContact(req, res) {
    const { message, email, subject } = req.body;

    await Contact.create({ message, email, subject });

    res.json({
      message: "sucessfully contact recived!",
    });
  },
  getQuestions(req, res) {
    res.json({
      data: questions,
    });
  },

  getCsrfToken(req, res) {
    res.json(req.csrfToken());
  },

  healthCheck(req, res) {
    res.json("ok");
  },

  getFaqs(req, res) {
    res.json({
      data: faqs,
    });
  },

  async getLocations(req, res) {
    res.json({
      data: await Location.find(),
    });
  },
};
