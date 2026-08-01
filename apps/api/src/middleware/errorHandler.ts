import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid request" });
  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
};
