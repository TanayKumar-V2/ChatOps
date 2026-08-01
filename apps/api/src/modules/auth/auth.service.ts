import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { users } from "../../db/schema/index.js";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  const expectedKey = Buffer.from(key, "hex");
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}

export async function createAccessToken(userId: string) {
  return new SignJWT({ type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.JWT_SECRET));
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return user;
}
