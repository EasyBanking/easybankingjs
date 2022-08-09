const { config } = require("dotenv");
const { join } = require("path");

config({ path: join(process.cwd(), `${process.env.NODE_ENV}.env`) });

const http = require("http");
const { wrapSocketIo } = require("./web-sockets/io");
const mongodb = require("./modules/mongodb");
const express = require("./express/server");
const redis = require("./modules/redis");
const { logger } = require("./modules/logger");

async function main() {
  const srv = http.createServer(express.app);

  const io = wrapSocketIo(srv);

  const mongoConnection = mongodb();

  const redisConnection = redis.createConnection();

  srv.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
  });
}

main().catch(logger.error);
