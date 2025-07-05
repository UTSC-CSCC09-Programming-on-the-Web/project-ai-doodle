import { Router } from "express";
import { Room } from "../models/rooms.js";

export const roomRouter = Router();

roomRouter.post("/", async (req, res) => {
  const { name, passcode, creatorUsername } = req.body;

  if (!name || !passcode || !creatorUsername) {
    return res.status(422).json({ error: "Missing required fields" });
  }

  try {
    const existing = await Room.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: "Room name already exists" });
    }

    const newRoom = await Room.create({
      name,
      passcode,
      creatorUsername,
    });

    res.status(200).json(newRoom);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create room", details: err.message });
  }
});

roomRouter.post("/join", async (req, res) => {
  const { name, passcode } = req.body;

  if (!name || !passcode) {
    return res.status(422).json({ error: "Missing room name or passcode" });
  }

  try {
    const room = await Room.findOne({ where: { name } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.passcode !== passcode) {
      return res.status(401).json({ error: "Incorrect passcode" });
    }

    const roomData = room.toJSON();
    delete roomData.passcode;

    return res
      .status(200)
      .json({ message: "Joined successfully", room: roomData });
  } catch (err) {
    console.error("Join room error:", err);
    return res
      .status(500)
      .json({ error: "Failed to join room", details: err.message });
  }
});

roomRouter.get("/:id", async (req, res) => {
  if (isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: "Invalid room ID" });
  }

  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    const roomData = room.toJSON();

    const requester = req.user?.username;
    if (!requester) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (roomData.creatorUsername !== requester) {
      delete roomData.passcode;
    }

    res.status(200).json(roomData);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch room", details: err.message });
  }
});
