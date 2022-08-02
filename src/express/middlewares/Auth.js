const { auth } = require("../../modules/passport");
const { Unauthorized } = require("http-errors");

const Authorize = (role) => {
  return (req, res, next) => {
    const { user } = req;

    if (!user) {
      throw new Unauthorized();
    }

    if (Array.isArray(role)) {
      if (!role.includes(user.role)) {
        throw new Unauthorized();
      }

      return next();
    }

    if (user.role !== role) {
      throw new Unauthorized();
    }

    return next();
  };
};

const isAuthenticated = (role) => {
  const authMiddlewares = [
    auth.authenticate("jwt", {
      session: false,
    }),
  ];

  if (role) {
    authMiddlewares.push(Authorize(role));
  }

  return authMiddlewares;
};

module.exports = isAuthenticated;
