const express = require("express");
require("express-async-errors");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const timeout = require("connect-timeout");
const celebrate = require("celebrate");
const { morganMiddleware } = require("../modules/logger");
const errorHandler = require("./middlewares/ErrorHandler");
const routes = require("./routes");
const app = express();
const bodyparser = require("body-parser");
const csurf = require("csurf");
const isDev = process.env.NODE_ENV === "development";

const rateLimitConf = {
  windowMs: 15 * 60 * 1000,
  max: 100,
};

const cookieConf = {
  httpOnly: false,
  secret: process.env["COOKIE_SECRET"],
  sameSite: true,
  path: "/",
  secure: !isDev,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  keys: {
    init: 0,
  },
};

app.use(helmet());
app.use(compression());
app.use(morganMiddleware);
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser(process.env["COOKIE_SECRET"]));
app.use(cookieSession(cookieConf));
app.use(hpp());
app.use(
  cors({
    credentials: true,
    origin: [process.env.ADMIN_ORIGIN, process.env.CLIENT_ORIGIN],
  })
);

if (!isDev) {
  app.use(rateLimit(rateLimitConf));
}

app.use(
  csurf({
    cookie: {
      sameSite: false,
      maxAge: 3600,
    },
  })
);

app.use(timeout("40s"));

// routes should be here

app.use("/api", routes);

// after route handlers
app.use(celebrate.errors({ statusCode: 400 }));
app.use(errorHandler);

module.exports = { app };
