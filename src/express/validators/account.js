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

const find = {
  query: Joi.object({
    id: Joi.string().required().length(24),
  }),
};

const pay = {
  body: Joi.object({
    atmPin: Joi.string().length(4).required(),
    amount: Joi.number().required(),
  }),
};

const readPayment = {
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

const Transactions = {
  query: Joi.object({
    limit: Joi.number(),
  }),
};

const schedules = ["teller", "customer serivce", "other"];

const createSchedule = {
  body: Joi.object({
    date: Joi.string().required(),
    location_id: Joi.string().length(24).required(),
    type: Joi.string()
      .equal(...schedules)
      .required(),
  }),
};

const deleteSchedule = {
  body: Joi.object({
    location_id: Joi.string().length(24).required(),
    timestamp: Joi.string().required(),
    schedule_id: Joi.string().length(24).required(),
  }),
};

module.exports = {
  deleteSchedule,
  update_admin,
  createSchedule,
  objectId,
  Transactions,
  pay,
  readPayment,
  transferMoney,
  search,
  find,
  updateAccount,
  createAccount,
};
