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

const activate = {
  params: Joi.object({
    token: Joi.string().length(32).required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    email: Joi.string().email().min(5).required(),
    question: Joi.string().min(5).max(255).required(),
    answear: Joi.string().min(5).max(255).required(),
  }),
};

const changePassword = {
  body: Joi.object({
    password: Joi.string().min(5).max(55).required(),
  }),
  params: {
    token: Joi.string().length(32).required(),
  },
};

const login = {
  body: Joi.object({
    username: Joi.string().min(5).max(55).required(),
    password: Joi.string().min(5).max(55).required(),
    remember: Joi.boolean().required(),
  }),
};

module.exports = { register, activate, changePassword, login, resetPassword };
