import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { sanitizeProgress, type ProgressState } from "@/lib/progress";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let progress: ProgressState | null = null;
  const row = getDb()
    .prepare("SELECT data FROM progress WHERE user_id = ?")
    .get(user.id) as { data: string } | undefined;
  if (row) {
    try {
      progress = sanitizeProgress(JSON.parse(row.data));
    } catch {
      progress = null;
    }
  }
  return NextResponse.json({ user, progress });
}