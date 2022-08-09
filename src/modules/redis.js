const ioredis = require("ioredis");

let con = null;

const createConnection = () => {
  if (!con) {
    con = new ioredis({
      port: process.env["REDIS_PORT"],
      host: process.env["REDIS_HOST"],
      password: process.env["REDIS_PASSWORD"],
      username: process.env.REDIS_NAME,
      db: process.env.REDIS_DB,
    });
  }

  return con;
};

module.exports = { createConnection };
