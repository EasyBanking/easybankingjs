if (process.env.NODE_ENV !== "production") {
  require("dotenv")?.config();
}
const http = require("http");
const { wrapSocketIo } = require("./web-sockets/io");
const mongodb = require("./modules/mongodb");
const express = require("./express/server");
const redis = require("./modules/redis");
const cronJobs = require("./modules/cron-jobs");
const { logger } = require("./modules/logger");

async function main() {
  const srv = http.createServer(express.app);

  const io = await wrapSocketIo(srv);

  const mongoConnection = mongodb();

  const redisConnection = redis.createConnection();

  await cronJobs(redisConnection);
  
  srv.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
  });
}

main().catch(logger.error);
