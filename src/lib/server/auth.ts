import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/progress";
import { getDb } from "./db";

export const SESSION_COOKIE = "atlas_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

export function verifyPassword(
  password: string,
  salt: string,
  hash: string,
): boolean {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function clearExpiredSessions(): void {
  getDb()
    .prepare("DELETE FROM sessions WHERE expires_at < ?")
    .run(Date.now());
}

export function createSession(userId: number): string {
  const token = randomBytes(32).toString("hex");
  getDb()
    .prepare(
      "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    )
    .run(token, userId, Date.now() + SESSION_TTL_MS);
  return token;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.username, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token) as { id: number; username: string; expires_at: number } | undefined;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return { id: row.id, username: row.username };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.ATLAS_COOKIE_SECURE === "1",
    maxAge: SESSION_TTL_MS / 1000,
  };
}