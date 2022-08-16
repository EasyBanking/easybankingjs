const { InternalServerError, isHttpError } = require("http-errors");
const { logger } = require("../../modules/logger");

module.exports = function (err, req, res, ext) {
  logger.error(err);

  if (isHttpError(err)) {
    return res.status(err.statusCode).json(err);
  }

  return res.status(500).json(new InternalServerError());
};
