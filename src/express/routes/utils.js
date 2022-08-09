const controller = require("../controllers/utils");
module.exports = (router) => {
  router.get("/questions", controller.getQuestions);
};
