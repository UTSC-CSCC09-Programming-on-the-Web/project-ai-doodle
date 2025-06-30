import { Router } from "express";
import { Room } from "../models/rooms.js";

export const roomRouter = Router();

roomRouter.post("/", async (req, res) => {
  const { name, passcode, capacity, creatorUsername } = req.body;

  if (!name || !passcode || !capacity || !creatorUsername) {
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
      capacity,
      creatorUsername,
    });

    res.status(200).json(newRoom);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create room", details: err.message });
  }
});

roomRouter.get("/by-name/:name", async (req, res) => {
  try {
    const room = await Room.findOne({ where: { name: req.params.name } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json(room);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch room", details: err.message });
  }
});

roomRouter.get("/:id", async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    const { passcode, ...safeRoomData } = room.toJSON();
    res.status(200).json(safeRoomData);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch room", details: err.message });
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

    const { passcode, ...safeRoomData } = room.toJSON();
    return res
      .status(200)
      .json({ message: "Joined successfully", room: safeRoomData });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to join room", details: err.message });
  }
});
