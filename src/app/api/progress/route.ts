import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { sanitizeProgress } from "@/lib/progress";

export const runtime = "nodejs";

const MAX_PROGRESS_BYTES = 100_000;

async function saveBody(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    /* body inválido */
  }
  const progress = sanitizeProgress(body);
  if (!progress) {
    return NextResponse.json({ error: "Progreso inválido." }, { status: 400 });
  }

  const json = JSON.stringify(progress);
  if (json.length > MAX_PROGRESS_BYTES) {
    return NextResponse.json({ error: "Progreso demasiado grande." }, { status: 413 });
  }

  getDb()
    .prepare(
      `INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .run(user.id, json, Date.now());

  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  return saveBody(req);
}

export async function POST(req: Request) {
  return saveBody(req);
}