const ioredis = require("ioredis");

const createConnection = () => new ioredis(process.env.REDISDB_URI);

module.exports = { createConnection };
