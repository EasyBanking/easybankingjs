const { Joi } = require("celebrate");

const register = {
  body: Joi.object({
    username: Joi.string().min(5).max(55).required(),
    email: Joi.string().min(5).max(55).required(),
    password: Joi.string().min(5).max(55).required(),
    question: Joi.string().min(5).max(255).required(),
    answear: Joi.string().min(2).max(255).required(),
  }),
};

module.exports = { register };
