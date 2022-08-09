require("events").captureRejections = true;
const { User } = require("../../models/User");
const { Server, Socket } = require("socket.io");
const validate = require("../middlewares/validate");
const validator = require("../validators/user");
const { authenticate } = require("../middlewares/authenticate");
const { randomBytes } = require("crypto");

/**
 * queueItem id
 * userId
 */

const queue = [];

/**
 *  room.id -> for socket room
 * room.messages = [{ userId, message }]
 * room.users = [{ userId, adminId }]
 */
const rooms = [];

/**
 *
 * @param {Server} io
 */
module.exports = async (io) => {
  io.on("connection", (socket) => {
    //  on request chat
    socket
      .use(authenticate())
      .use(validate(validator.requestQueue))
      .on("user.requireChat", onUserRequestChat(socket));

    // on user join chat
    socket
      .use(authenticate("ADMIN"))
      .use(validate(validator.joinChat))
      .on("user.joinChat", onUserJoinedChat(socket));

    // on user leave chat
    socket
      .use(validate(validator.leaveChat))
      .on("user.leaveChat", onUserLeaveChat(socket));

    // on message
    socket
      .use(authenticate())
      .use(validate(validator.message))
      .on("message", onMessage(socket));

    // eror handleing
    socket.on("error", onError);
  });

  // sockets services

  /**
   * @param {Socket} socket
   */
  function onUserRequestChat(socket) {
    return async (data) => {
      const { userId } = data;

      queue.push({ userId, id: randomBytes(10).toString("hex") });

      const transformed = queue.map(async (q) => {
        return {
          id: q.id,
          userId: await MapUser(q.userId),
        };
      });

      socket.emit("user.queue", {
        queue: transformed,
        peek: transformed[0],
      });
    };
  }

  /**
   *
   * @param {Socket} socket
   * @returns
   */
  function onUserJoinedChat(socket) {
    return async (data) => {
      const { userId, adminId } = data;

      const room = {
        users: [userId, adminId],
        id: randomBytes(10).toString("hex"),
        messages: [],
      };

      rooms.push(room);

      socket.join(room.id);

      room.users = await MapUsers(room.users);

      socket.to(room.id).emit("room.init", { room });
    };
  }

  /**
   *
   * @param {Socket} socket
   * @returns
   */
  function onMessage(socket) {
    return async (data) => {
      const { userId, message, roomId } = data;

      const roomIdx = rooms.findIndex((room) => room.id == roomId);

      if (roomIdx == -1) {
        throw Error("Room not found");
      }

      const room = rooms[roomIdx];

      const msg = {
        content: message,
        date: Date.now(),
        userId,
      };

      room.messages.push(msg);

      rooms[roomIdx] = room;

      room.users = await MapUsers(room.users);

      socket.to(room.id).emit("room.message", { room });
    };
  }

  /**
   *
   * @param {Socket} socket
   * @returns
   */
  function onUserLeaveChat(socket) {
    return async (data) => {
      const { roomId } = data;

      const room = rooms.findIndex((room) => room.id == roomId);

      if (!room) {
        throw Error("Room not found");
      }

      rooms.splice(room, 1);

      await socket.leave(roomId);
    };
  }

  /**
   *
   * @param {Socket} socket
   * @returns
   */
  function onError(socket) {
    return (err) => {
      socket.emit("error", { data: err.data });
    };
  }

  /**
   *
   * @param {Array<string>} users
   * @returns {Arrray<User>}
   */
  async function MapUsers(users) {
    return await User.find({
      _id: { $in: users },
    })
      .select(["_id", "username", "profileImg"])
      .orFail(new Error("users not found"));
  }

  /**
   *
   * @param {string} user
   * @returns {User}
   */
  async function MapUser(user) {
    return await User.findOne({
      _id: user,
    })
      .select(["_id", "username", "profileImg"])
      .orFail(new Error("user not found"));
  }
};
