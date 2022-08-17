const { Joi } = require("celebrate");

const search = {
  query: Joi.object({
    address: Joi.string().min(3).max(55),
  }),
};

const findNearest = {
  query: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }),
};

module.exports = { search, findNearest };
