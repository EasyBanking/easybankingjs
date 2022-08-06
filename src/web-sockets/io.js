const { Server } = require("socket.io");
const socketListenerWrapper = require("./listeners");

const wrapSocketIo = (http) => {
  const io = new Server(http);

  socketListenerWrapper(io);

  return io;
};

module.exports = { wrapSocketIo };
