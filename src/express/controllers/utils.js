const questions = require("../../models/Questions.json");
const faqs = require("../../models/faqs.json");
const { Location } = require("../../models/Location");

module.exports = {
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
