import http from "node:http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { redis, redisSubscriber } from "./config/redis.js";
import { registerSocketHandlers } from "./sockets/socket.js";

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: env.CLIENT_URL, credentials: true } });

async function start() {
  await redis.connect();
  await redisSubscriber.connect();
  io.adapter(createAdapter(redis, redisSubscriber));
  registerSocketHandlers(io);
  httpServer.listen(env.PORT, "0.0.0.0", () => console.log(`ChatOps API listening on ${env.PORT}`));
}

start().catch((error) => { console.error(error); process.exit(1); });
