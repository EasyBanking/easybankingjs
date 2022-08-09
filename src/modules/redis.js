const ioredis = require("ioredis");

let con = null;

const createConnection = () => {
  if (!con) {
    con = new ioredis({
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB,
    });
  }

  return con;
};

module.exports = { createConnection };
