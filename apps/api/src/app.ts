import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { messageRouter } from "./modules/messages/message.routes.js";
import { roomRouter } from "./modules/rooms/room.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";

export const app = express();
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(healthRouter);
app.use("/api", authRouter);
app.use("/api", messageRouter);
app.use("/api", roomRouter);
app.use(errorHandler);
