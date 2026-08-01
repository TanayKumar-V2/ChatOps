import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const envCandidates = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")];
const envPath = envCandidates.find((candidate) => existsSync(candidate));
config(envPath ? { path: envPath } : undefined);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(16),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
