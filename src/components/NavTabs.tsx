"use client";

import type { View } from "./AtlasApp";
import { dateKey } from "@/lib/daily";

export function NavTabs({
  view,
  onChange,
  dailyPending,
}: {
  view: View;
  onChange: (v: View) => void;
  dailyPending: boolean;
}) {
  const tabs: { id: View; label: string; emoji: string }[] = [
    { id: "map", label: "Mapa", emoji: "🗺️" },
    { id: "games", label: "Jugar", emoji: "🎮" },
    { id: "daily", label: "Reto diario", emoji: "📅" },
    { id: "passport", label: "Pasaporte", emoji: "🛂" },
  ];

  return (
    <nav className="nice-scroll -mx-1 -my-1 flex gap-2 overflow-x-auto px-1 py-1">
      {tabs.map((t) => {
        const active = view === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`btn-press relative shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
              active
                ? "border-amber-300/60 bg-amber-300/15 text-amber-200 shadow-lg shadow-amber-900/20"
                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10"
            }`}
          >
            {t.emoji} {t.label}
            {t.id === "daily" && dailyPending && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[10px] font-black text-black">
                !
              </span>
            )}
            {t.id === "daily" && !dailyPending && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 text-[9px] font-black text-black">
                ✓
              </span>
            )}
          </button>
        );
      })}
      <span className="ml-auto hidden items-center text-[11px] text-zinc-600 sm:flex">
        Hoy: {dateKey()}
      </span>
    </nav>
  );
}