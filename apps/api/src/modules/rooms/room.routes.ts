import { Router } from "express";
import { z } from "zod";
import { httpAuth } from "../../middleware/httpAuth.js";
import { createRoomForUser, joinRoomWithCode, listRoomsForUser } from "./room.service.js";

export const roomRouter = Router();
const createRoomSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(240).nullable().optional() });
const joinRoomSchema = z.object({ code: z.string().trim().min(6).max(32) });

roomRouter.get("/rooms", httpAuth, async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Authentication required" });
    res.json({ rooms: await listRoomsForUser(req.userId) });
  } catch (error) { next(error); }
});

roomRouter.post("/rooms", httpAuth, async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Authentication required" });
    const input = createRoomSchema.parse(req.body);
    const room = await createRoomForUser(input.name, input.description || null, req.userId);
    res.status(201).json({ room });
  } catch (error) { next(error); }
});

roomRouter.post("/rooms/join", httpAuth, async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Authentication required" });
    const input = joinRoomSchema.parse(req.body);
    const room = await joinRoomWithCode(input.code, req.userId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ room: { ...room, joined: true } });
  } catch (error) { next(error); }
});
