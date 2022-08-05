const passport = require("passport");
const jwt = require("passport-jwt");
const { User } = require("../models/User");

const auth = passport;

const options = {
  secretOrKey: process.env["JWT_SECRET"],
  jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
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
