const { config } = require("dotenv");
const { join } = require("path");

if (process.env.NODE_ENV === "development") {
  config({ path: join(process.cwd(), `${process.env.NODE_ENV}.env`) });
}

const http = require("http");
const { wrapSocketIo } = require("./web-sockets/io");
const mongodb = require("./modules/mongodb");
const express = require("./express/server");
//const redis = require("./modules/redis");
const { logger } = require("./modules/logger");

async function main() {
  const srv = http.createServer(express.app);

  const io = wrapSocketIo(srv);

  const mongoConnection = await mongodb.createConnection();

  // const redisConnection = redis.createConnection();
  srv.listen(4000, () => {
    logger.info(`Server is running on port ${4000}`);
    console.log("connection successful");
  });
}

main().catch(logger.error);
