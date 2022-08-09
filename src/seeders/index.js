const { config } = require("dotenv");
const { join } = require("path");
const { logger } = require("../modules/logger");
const mongo = require("../modules/mongodb");

// seeders

const LoctionSeeder = require("./location");
const UsersSeeder = require("./user");

if (process.env.NODE_ENV === "development") {
  config({ path: join(process.cwd(), `${process.env.NODE_ENV}.env`) });
}

// seeders array here
const seeders = [LoctionSeeder, UsersSeeder];

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
