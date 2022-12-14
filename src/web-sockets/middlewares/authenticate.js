const jsonWebToken = require("jsonwebtoken");
const { Socket } = require("socket.io");
const { User } = require("../../models/User");

exports.authenticate = (role) => {
  /**
   * @param {Socket} socket
   */
  return (socket, next) => {
    const token = socket.handshake.auth["token"];

    if (!token) {
      next(new Error("Unauthorized"));
    }

    jsonWebToken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        next(new Error("Unauthorized"));
      }

      User.findById(decoded.id)
        .then((user) => {
          if (!user) {
            next(new Error("Unauthorized"));
          }

          if (role) {
            if (user.role !== role) {
              next(new Error("Unauthorized"));
            }
          }

          next();
        })
        .catch(next);
    });

    next();
  };
};
