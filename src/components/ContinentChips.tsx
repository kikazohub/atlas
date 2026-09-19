"use client";

import { CONTINENT_META, CONTINENT_ORDER, type ContinentId } from "@/lib/constants";

export type Scope = "world" | ContinentId;

export function ContinentChips({
  selected,
  onChange,
  counts,
  showCounts = true,
}: {
  selected: Scope;
  onChange: (s: Scope) => void;
  counts?: Record<ContinentId, number>;
  showCounts?: boolean;
}) {
  return (
    <div className="nice-scroll flex flex-wrap gap-2">
      <button
        onClick={() => onChange("world")}
        className={`btn-press rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
          selected === "world"
            ? "border-amber-300/60 bg-amber-300/15 text-amber-200"
            : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
        }`}
      >
        🌍 Todos
      </button>
      {CONTINENT_ORDER.map((c) => {
        const meta = CONTINENT_META[c];
        const active = selected === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`btn-press rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
              active
                ? "border-amber-300/60 bg-amber-300/15 text-amber-200"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            {meta.emoji} {meta.label}
            {showCounts && counts && (
              <span className={active ? "ml-1.5 text-amber-200/80" : "ml-1.5 text-zinc-500"}>
                {counts[c] ?? 0}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}