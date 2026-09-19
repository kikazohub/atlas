import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import {
  SESSION_COOKIE,
  clearExpiredSessions,
  createSession,
  hashPassword,
  sessionCookieOptions,
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
  const u = typeof username === "string" ? username.trim() : "";
  const p = typeof password === "string" ? password : "";

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(u)) {
    return NextResponse.json(
      { error: "El usuario debe tener entre 3 y 20 caracteres (letras, números o _)." },
      { status: 400 },
    );
  }
  if (p.length < 8 || p.length > 72) {
    return NextResponse.json(
      { error: "La contraseña debe tener entre 8 y 72 caracteres." },
      { status: 400 },
    );
  }

  clearExpiredSessions();
  const db = getDb();
  const name = u.toLowerCase();

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(name);
  if (existing) {
    return NextResponse.json({ error: "Ese usuario ya existe." }, { status: 409 });
  }

  const { salt, hash } = hashPassword(p);
  const created = db
    .prepare(
      "INSERT INTO users (username, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(name, salt, hash, new Date().toISOString());
  const userId = Number(created.lastInsertRowid);
  const token = createSession(userId);

  const res = NextResponse.json({ user: { id: userId, username: name } });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}