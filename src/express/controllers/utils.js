const questions = require("../../models/Questions.json");
const faqs = require("../../models/faqs.json");

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
};
