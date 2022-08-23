const { config } = require("dotenv");

config();

const { logger } = require("../modules/logger");

const mongo = require("../modules/mongodb");

// seeders
const LoctionSeeder = require("./location");
const userSeeder = require("./user");
const paymentsSeeder = require("./Payements");
const transactionSeeder = require("./Transactions");
const urgentSeeder = require("./Urgent");
const scheduleSeeder = require("./Schedule");

// seeders array here
const seeders = [
  LoctionSeeder,
  userSeeder,
  paymentsSeeder,
  urgentSeeder,
  transactionSeeder,
  scheduleSeeder
];

async function main() {
  const con = await mongo();

  for (let seeder of seeders) {
    await seeder();
    logger.info(`successfully seeding ${seeder.label}`);
  }

  await con.disconnect();
}

main()
  .catch(console.log)
  .finally(() => {
    process.exit(1);
  });
