import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import {
  SESSION_COOKIE,
  clearExpiredSessions,
  createSession,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    /* body inválido */
  }
  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };
  const u = typeof username === "string" ? username.trim().toLowerCase() : "";
  const p = typeof password === "string" ? password : "";

  clearExpiredSessions();
  const user = getDb()
    .prepare(
      "SELECT id, username, password_salt, password_hash FROM users WHERE username = ?",
    )
    .get(u) as
    | { id: number; username: string; password_salt: string; password_hash: string }
    | undefined;

  if (!user || !verifyPassword(p, user.password_salt, user.password_hash)) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const token = createSession(user.id);
  const res = NextResponse.json({ user: { id: user.id, username: user.username } });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}