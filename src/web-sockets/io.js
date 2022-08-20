const { Server } = require("socket.io");
const queueController = require("./listeners/chatqueue");
const wrapSocketIo = async (http) => {
  const io = new Server(http, {
    cors: {
      origin: [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN],
      credentials: true,
    },
  });

  await queueController(io);

  return io;
};

module.exports = { wrapSocketIo };
