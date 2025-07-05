import { Server } from "socket.io";
import { getRoomUsers, setRoomUsers } from "./roomStore.js";
import { redis } from "./redisClient.js";

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("joinRoom", async ({ roomId, username }) => {
      socket.join(roomId);

      let users = await getRoomUsers(roomId);
      let existing = users.find((u) => u.username === username);

      if (existing) {
        existing.socketId = socket.id;
      } else {
        users.push({ username, socketId: socket.id, ready: false });
      }

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
    });

    socket.on("setReady", async ({ roomId, username, ready }) => {
      const users = await getRoomUsers(roomId);
      const user = users.find((u) => u.username === username);
      if (user) user.ready = ready;

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
    });

    socket.on("startGame", (roomId) => {
      io.to(roomId).emit("gameStarted");
    });

    socket.on("leaveRoom", async ({ roomId, username }) => {
      let users = await getRoomUsers(roomId);
      users = users.filter((u) => u.username !== username);

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
    });

    socket.on("disconnect", async () => {
      const keys = await redis.keys("room:*");
      for (const key of keys) {
        const roomId = key.split(":")[1];
        const users = await getRoomUsers(roomId);
        const updatedUsers = users.map((u) => {
          if (u.socketId === socket.id) {
            return { ...u, socketId: null };
          }
          return u;
        });
        await setRoomUsers(roomId, updatedUsers);
        io.to(roomId).emit("roomUpdate", updatedUsers);
      }
    });
  });
}
