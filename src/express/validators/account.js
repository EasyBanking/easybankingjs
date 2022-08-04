const { Joi } = require("celebrate");

const transferMoney = {
  body: Joi.object({
    senderId: Joi.string().length(24).required(),
    receiverId: Joi.string().length(24).required(),
    amount: Joi.number().required(),
    atmPin: Joi.string().length(4).required(),
  }),
};

const search = {
  query: Joi.object({
    username: Joi.string().min(3).max(55),
  }),
};

const updateAccount = {
  body: Joi.object({
    firstName,
    lastName,
    dateOfBirth,
    addresse,
    atmPin,
    nationalId,
  }),
  params: Joi.object({
    accountId: Joi.string().length(24).required(),
  }),
};

const createAccount = {
  body: Joi.object({
    atmPin: Joi.string().length(4).required(),
    firstName: Joi.string().min(2).max(55).required(),
    lastName: Joi.string().min(2).max(55).required(),
    nationalId: Joi.string().min(2).max(55).required(),
    dateOfBirth: Joi.string().min(2).max(55).required(),
    addresse: Joi.string().min(2).max(55).required(),
  }),
  params: Joi.object({
    userId: Joi.string().length(24).required(),
  }),
};

module.exports = { transferMoney, search, updateAccount, createAccount };
