const { logger } = require("../../modules/logger");
module.exports = (io) => {
  const fs = require("fs");
  const path = require("path");

  const listenerPath = __dirname;

  fs.readdir(listenerPath, (err, files) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    files.map(async (filename) => {
      if (filename !== "index.js") {
        logger.debug(`Initializing listener at: ${filename}`);
        const listener = require(path.resolve(__dirname, filename));

        await listener(io);
      }
    });
  });
};
