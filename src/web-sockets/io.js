const { Server } = require("socket.io");

const wrapSocketIo = (http) => {
  const io = new Server(http);

  io.on("connection", (s) => {
    // do something here

    console.log("socket io is connected");
  });

  return io;
};

module.exports = { wrapSocketIo };
