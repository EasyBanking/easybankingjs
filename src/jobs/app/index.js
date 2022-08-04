const { Worker, Queue, QueueScheduler } = require("bullmq");
const { redis, jobs } = require("../../helpers/constants");
const { Token } = require("../../models/Tokens");
const { User } = require("../../models/User");

const AppQueue = new Queue("AppQueue", {
  connection: redis,
});

const AppScheduler = new QueueScheduler("AppQueue", { connection: redis });

const handleTokensJobs = async (job) => {
  if (job.name === jobs.DELETE_EMAIL_ACTIVATION_TOKEN) {
    await Token.findOneAndRemove(new Types.ObjectId(job.data.id));
    logger.info("Token cleared from database");
  }

  if (job.name === jobs.DELETE_UNACTIVATED_USER) {
    await User.findOneAndRemove(new Types.ObjectId(job.data.id));
    logger.info("User cleared from database");
  }
};

const AppWorker = new Worker("AppQueue", handleTokensJobs, {
  connection: redis,
});

module.exports = { AppQueue };
