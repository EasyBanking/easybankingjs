const winston = require("winston");
const morgan = require("morgan");
const { join } = require("path");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const isDev = process.env.NODE_ENV === "development";

const level = () => {
  return isDev ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const devFormat = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}: ${
        info.stack ? `\n${info.stack}` : ""
      }`
  )
);

const fileFormat = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console({
    format: devFormat,
  }),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: join(process.cwd(), "logs", "error.log"),
    level: "error",
    format: fileFormat,
  }),
  // Allow to print all the error message inside the all.log file
  // (also the error log that are also printed inside the error.log(
  new winston.transports.File({
    filename: join(process.cwd(), "logs", "app.log"),
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: level(),
  format: devFormat,
  levels,
  transports,
});

// middlewaers
const stream = {
  // Use the http severity
  write: (message) => logger.http(message.trim()),
};

const skip = () => !isDev;

const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

module.exports = {
  logger,
  morganMiddleware,
};
