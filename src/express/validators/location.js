const { Joi } = require("celebrate");

const search = {
  query: Joi.object({
    address: Joi.string().min(5).max(55),
  }),
};

const findNearest = {
  query: Joi.object({
    lat: Joi.number().required(),
    lon: Joi.number().required(),
  }),
};

module.exports = { search, findNearest };
