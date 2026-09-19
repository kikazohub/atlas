"use client";

import { useEffect } from "react";
import { BADGES } from "@/lib/badges";

export function BadgesGallery({
  owned,
  onClose,
}: {
  owned: Set<string>;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card nice-scroll flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-50">🏅 Medallas de explorador</h2>
            <p className="text-xs text-zinc-400">
              {owned.size}/{BADGES.length} desbloqueadas. Sigue cumpliendo retos…
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-press grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-300"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {BADGES.map((b) => {
            const has = owned.has(b.id);
            return (
              <div
                key={b.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  has
                    ? "border-amber-300/25 bg-amber-300/[0.06]"
                    : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-xl ${
                    has ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-white/5 grayscale"
                  }`}
                >
                  {b.emoji}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${has ? "text-amber-100" : "text-zinc-400"}`}>
                    {b.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">{b.desc}</p>
                </div>
                {has && <span className="ml-auto text-lg">✅</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}