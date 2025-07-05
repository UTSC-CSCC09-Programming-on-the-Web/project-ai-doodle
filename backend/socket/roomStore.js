import { redis } from "./redisClient.js";

const roomKey = (roomId) => `room:${roomId}`;

export async function getRoomUsers(roomId) {
  const data = await redis.get(roomKey(roomId));
  return data ? JSON.parse(data) : [];
}

export async function setRoomUsers(roomId, users) {
  await redis.set(roomKey(roomId), JSON.stringify(users));
}
