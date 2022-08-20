const { Socket } = require("socket.io");

module.exports = (schema) => {
  /**
   * @param {Socket} socket
   */
  return async (socket, next) => {
    try {
      if (!socket[1]) {
        throw new Error("body is required");
      }
      const isValid = await schema?.validateAsync(socket?.[1] || {});
      next();
    } catch (err) {
      console.log(err, "middelware");
      err.data = { content: err.message };
      next(err);
    }
  };
};
