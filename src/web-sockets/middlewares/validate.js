const { Socket } = require("socket.io");

module.exports = (schema) => {
  /**
   * @param {Socket} socket
   */
  return async (socket, next) => {
    try {
      const [message, body] = socket;
      const isValid = await schema?.validateAsync(body);
      next();
    } catch (err) {
      err.data = { content: err.message };
      next(err);
    }
  };
};
