const { Joi } = require("celebrate");

const requestQueue = Joi.object({
  id: Joi.string().length(24).required(),
});

const message = Joi.object({
  userId: Joi.string().length(24).required(),
  message: Joi.string().required(),
  roomId: Joi.string().length(16).required(),
});

const joinChat = Joi.object({
  userId: Joi.string().length(24).required(),
  adminId: Joi.string().length(24).required(),
});

const leaveChat = Joi.object({
  roomId: Joi.string().length(16).required(),
});

module.exports = { requestQueue, message, joinChat, leaveChat };
