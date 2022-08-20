require("events").captureRejections = true;
const { User } = require("../../models/User");
const { Server, Socket } = require("socket.io");
const { authenticate } = require("../middlewares/authenticate");
const { randomBytes } = require("crypto");
const { logger } = require("../../modules/logger");
const { Types } = require("mongoose");

/**
 * queueItem id
 * userId
 */

const queueSockets = new Map();

const queue = new Set([]);

/**
 * admins
 * admin {id,username,pic}
 * socket id
 */
const admins = new Set([]);
/**
 *  room.id -> for socket room
 * room.messages = [{ userId, message }]
 * room.users = [{ userId, adminId }]
 */
const rooms = new Map();

/**
 *
 * @param {Server} io
 */
module.exports = async (io) => {
  io /*.use(authenticate())*/.on("connection", (socket) => {
    //  on request chat
    socket.on("admin.online", async (admin) => {
      admins.add(admin);
      await socket.join("admins");
      logger.info(`admin has logined ${socket.id} - ${admin?.username}`);
      io.sockets.in("admins").emit("admin.logined", { admin });
    });

    socket.on("get.queue", async () => {
      try {
        const ids = Array.from(queue);
        io.sockets.in("admins").emit("queue", { queue: await MapUsers(ids) });
      } catch (err) {
        io.sockets.in("admins").emit("queue", { queue: [] });
      }
    });

    socket.on("user.disconnect", async ({ id }) => {
      console.log(id, "id discconected");
      queue.delete(id);
      const ids = Array.from(queue);
      io.sockets.in("admins").emit("queue", { queue: await MapUsers(ids) });
    });

    socket.on("user.require-chat", onUserRequestChat(socket));

    // on user join chat
    socket.on("user.joinChat", async (data) => {
      const { admin_id, user_id } = data;

      const room_id = `r-${admin_id}-${user_id}`;

      const extractUserSockets = Array.from(queueSockets.values());

      const keys = Array.from(queueSockets.keys());

      let soc = "";

      for (let i = 0; i < extractUserSockets.length; i++) {
        if (extractUserSockets[i] == user_id) {
          soc = keys[i];
        }
      }

      // setting the room with empty messages array
      rooms.set(room_id, []);

      await socket.join(room_id);

      const mapAdmin = await MapUser(admin_id);

      socket.to(soc).emit("socket.ready", { ready: true, admin: mapAdmin });

      socket.emit("socket.ready", {
        ready: true,
        user: await MapUser(user_id),
      });
    });

    socket.on("socket.ok", async (data) => {
      const { admin_id, user_id } = data;

      const room = `r-${admin_id}-${user_id}`;

      await socket.join(room);

      io.sockets.in(room).emit("session.starts", { room });
    });

    socket.on("push.message", async (data) => {
      const { room, date, sender, content } = data;

      const mapMessage = {
        date,
        sender: await MapUser(sender),
        content,
      };

      const msgs = rooms?.get(room) || [];

      msgs.push(mapMessage);

      rooms.set(room, msgs);

      console.log(rooms.get(room));

      io.sockets.in(room).emit("messages", { messages: rooms.get(room) });
    });

    // on user leave chat
    /*socket.on("user.leaveChat", onUserLeaveChat(socket));

    // on message
    */

    socket.on("disconnect", async (r) => {
      if (queueSockets.has(socket.id)) {
        queue.delete(queueSockets.get(socket.id));
        const ids = Array.from(queue);
        queueSockets.delete(socket.id);
        io.sockets.in("admins").emit("queue", { queue: await MapUsers(ids) });
      }
    });

    // eror handleing
    socket.on("error", onError);
  });

  // sockets services

  /**
   * @param {Socket} socket
   */
  function onUserRequestChat(socket) {
    return async (data) => {
      const { id } = data;

      queue.add(id);

      const ids = Array.from(queue);

      const queueToCollection = await MapUsers(ids);

      socket.emit("wait.for.accept", { peek: ids.length });

      if (!queueSockets.has(socket.id)) {
        queueSockets.set(socket.id, id);
      }

      io.sockets.in("admins").emit("queue", { queue: queueToCollection });
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

      socket.emit("user.leave.message", "successfully leaved a chat.");
    };
  }

  /**
   *
   * @param {Socket} socket
   * @returns
   */
  function onError(socket) {
    return (err) => {
      console.log("error", err);
      socket.emit("error", { data: err });
    };
  }

  /**
   *
   * @param {Array<string>} users
   * @returns {Arrray<User>}
   */
  async function MapUsers(users) {
    return await User.find({
      _id: { $in: users.map((u) => new Types.ObjectId(u)) },
    }).select(["_id", "username", "profileImg"]);
  }

  /**
   *
   * @param {string} user
   * @returns {User}
   */
  function MapUser(user) {
    return User.findOne({
      _id: new Types.ObjectId(user),
    })
      .select(["_id", "username", "profileImg"])
      .orFail(new Error("user not found"));
  }
};
