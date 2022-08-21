const ioredis = require("ioredis");

module.exports = () => {
  if (!con) {
    con = new ioredis("redis://localhost:6379/0");
  }

  return con;
};
