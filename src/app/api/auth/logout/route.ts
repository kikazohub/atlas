import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}