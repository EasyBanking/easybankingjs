const controller = require("../controllers/utils");
module.exports = (router) => {
  router.get("/questions", controller.getQuestions);
  router.get("/faqs", controller.getFaqs);
  router.get("/csrf", controller.getCsrfToken);
  router.get("/health-check", controller.healthCheck);
};
