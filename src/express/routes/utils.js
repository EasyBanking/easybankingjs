const { celebrate, Joi } = require("celebrate");
const controller = require("../controllers/utils");
const authenticate = require("../middlewares/Auth");

const createContact = {
  body: Joi.object({
    message: Joi.string().min(3).max(2000).required(),
    subject: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
  }),
};

module.exports = (router) => {
  router.get("/questions", controller.getQuestions);
  router.get("/faqs", controller.getFaqs);
  router.get("/csrf", controller.getCsrfToken);
  router.get("/health-check", controller.healthCheck);
  router.get("/locations", authenticate(), controller.getLocations);
  router.post("/contact", celebrate(createContact), controller.createContact);
  router.get("/counters", authenticate("ADMIN"), controller.counts);
};
