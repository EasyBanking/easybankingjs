const questions = require("../../models/Questions.json");

module.exports = {
  getQuestions(req, res) {
    res.json({
      data: questions
    });
  },
};
