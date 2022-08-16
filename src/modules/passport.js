const passport = require("passport");
const jwt = require("passport-jwt");
const { User } = require("../models/User");

const auth = passport;

const options = {
  secretOrKey: "secret",
  jwtFromRequest: jwt.ExtractJwt.fromHeader(process.env["JWT_TOKEN_HEADER"]),
};

const authCb = async (payload, done) => {
  try {
    const user = await User.findOne({ id: payload?.id }).orFail();
    return done(null, user);
  } catch (er) {
    done(er, false);
  }
};

auth.use(new jwt.Strategy(options, authCb));

module.exports = { auth };
