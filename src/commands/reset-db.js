const { config } = require("dotenv");
const { join } = require("path");
const mongo = require("../modules/mongodb");
const { logger } = require("../modules/logger");

if (process.env.NODE_ENV === "development") {
  config({ path: join(process.cwd(), `${process.env.NODE_ENV}.env`) });
}

async function runScript() {
  const db = await mongo();

  const collections = await db.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany();
  }

  logger.info("collection are dropped");
}

runScript()
  .catch(console.log)
  .finally(() => process.exit(1));
