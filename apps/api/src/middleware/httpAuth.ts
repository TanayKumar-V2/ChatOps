import type { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request { userId?: string; }
  }
}

export const httpAuth: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    if (typeof payload.sub !== "string") throw new Error("Missing subject");
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
