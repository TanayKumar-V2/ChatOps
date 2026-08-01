import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { users } from "../../db/schema/index.js";
import { httpAuth } from "../../middleware/httpAuth.js";
import { createAccessToken, findUserByEmail, hashPassword, verifyPassword } from "./auth.service.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({ name: z.string().trim().min(2).max(120) });
const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  avatarUrl: z.string().url().nullable(),
});
export const authRouter = Router();

authRouter.post("/auth/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    if (await findUserByEmail(email)) return res.status(409).json({ error: "An account with this email already exists" });
    const [user] = await db.insert(users).values({ name: input.name, email, passwordHash: await hashPassword(input.password) }).returning({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl });
    res.status(201).json({ user, token: await createAccessToken(user.id) });
  } catch (error) { next(error); }
});

authRouter.post("/auth/login", async (req, res, next) => {
  try {
    const input = credentialsSchema.parse(req.body);
    const user = await findUserByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) return res.status(401).json({ error: "Email or password is incorrect" });
    res.json({ user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }, token: await createAccessToken(user.id) });
  } catch (error) { next(error); }
});

authRouter.get("/auth/me", httpAuth, async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Authentication required" });
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, req.userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) { next(error); }
});

authRouter.patch("/auth/me", httpAuth, async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Authentication required" });
    const input = profileSchema.parse(req.body);
    const [user] = await db.update(users)
      .set({ name: input.name, avatarUrl: input.avatarUrl })
      .where(eq(users.id, req.userId))
      .returning({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) { next(error); }
});
