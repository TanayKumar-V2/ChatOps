import { Router } from "express";
import { httpAuth } from "../../middleware/httpAuth.js";
import { isRoomMember, listMessages, togglePinnedMessage } from "./message.service.js";

export const messageRouter = Router();

messageRouter.get("/rooms/:roomId/messages", httpAuth, async (req, res, next) => {
  try {
    const roomId = req.params.roomId as string;
    if (!req.userId || !(await isRoomMember(roomId, req.userId))) return res.status(403).json({ error: "You are not a member of this room" });
    const result = await listMessages(roomId, req.query.before as string | undefined, Number(req.query.limit) || 40);
    res.json(result);
  } catch (error) { next(error); }
});

messageRouter.post("/rooms/:roomId/messages/:messageId/pin", httpAuth, async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Authentication required" });
    const result = await togglePinnedMessage(req.params.roomId as string, req.params.messageId as string, req.userId);
    if (!result) return res.status(404).json({ error: "Message not found" });
    res.json(result);
  } catch (error) { next(error); }
});
