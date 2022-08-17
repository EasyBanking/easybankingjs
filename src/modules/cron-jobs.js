const nodeSchedule = require("node-schedule");
const cronJobsGenerator = require("cron-time-generator");
const { logger } = require("./logger");
const { Cluster } = require("ioredis");
// initalization values
const COUNTER_KEY_REDIS = "counter";
const COUNTER_INIT_VALUE = {
  locations: {},
};

/**
 *
 * @param {Cluster} con
 */
module.exports = async (con) => {
  const counter_ = await con.exists(COUNTER_KEY_REDIS);

  if (!counter_) {
    con.set(COUNTER_KEY_REDIS, JSON.stringify(COUNTER_INIT_VALUE));
  }

  nodeSchedule // every day at 6 pm run this jobs [reset counter of scehdulers]
    .scheduleJob(
      "reset-counter",
      cronJobsGenerator.everyDayAt("18"),
      async (firedate) => {
        con.set(COUNTER_KEY_REDIS, JSON.stringify(COUNTER_INIT_VALUE));
        logger.info(`counter has reseted succesfully ${firedate}`);
      }
    );
};
