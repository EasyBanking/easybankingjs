const { logger } = require("../modules/logger");
const mongo = require("../modules/mongodb");
// seeders
const AdminSeeder = require("./admin");

// seeders array here
const seeders = [AdminSeeder];

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
