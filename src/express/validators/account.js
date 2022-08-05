const { Joi } = require("celebrate");

const transferMoney = {
  body: Joi.object({
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
    atmPin: Joi.string().length(4).required(),
    firstName: Joi.string().min(2).max(55).required(),
    lastName: Joi.string().min(2).max(55).required(),
    nationalId: Joi.string().min(2).max(55).required(),
    dateOfBirth: Joi.string().min(2).max(55).required(),
    addresse: Joi.string().min(2).max(55).required(),
  }),
  /* params:{
    otp:""
  }*/
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
};

const pay = {
  body: Joi.object({
    atmPin: Joi.string().length(4).required(),
    amount: Joi.number().required(),
  }),
};

const readPayment = {
  body: Joi.object({
    atmPin: Joi.string().length(4).required(),
  }),
  params: {
    token: Joi.string().length(16).required(),
  },
};

const objectId = {
  params: Joi.object({
    id: Joi.string().length(24),
  }),
};

const update_admin = {
  body: Joi.object({
    atmPin: Joi.string().length(4).required(),
    firstName: Joi.string().min(2).max(55).required(),
    lastName: Joi.string().min(2).max(55).required(),
    nationalId: Joi.string().min(2).max(55).required(),
    dateOfBirth: Joi.string().min(2).max(55).required(),
    addresse: Joi.string().min(2).max(55).required(),
    balance: Joi.number().required(),
    status: Joi.string(),
  }),
  params: Joi.object({
    id: Joi.string().length(24),
  }),
};

module.exports = {
  update_admin,
  objectId,
  pay,
  readPayment,
  transferMoney,
  search,
  updateAccount,
  createAccount,
};
