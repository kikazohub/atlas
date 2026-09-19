"use client";

import { COUNTRIES, type Country } from "@/lib/countries";
import { CONTINENT_META, CONTINENT_ORDER } from "@/lib/constants";
import { Flag } from "./Flag";

export function PassportView({
  discovered,
  onOpenCountry,
  onExplore,
  onResetConfirm,
}: {
  discovered: Set<string>;
  onOpenCountry: (cca2: string) => void;
  onExplore: () => void;
  onResetConfirm: () => void;
}) {
  const total = COUNTRIES.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="card anim-pop-in flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-3xl">
            🛂
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-zinc-50">Tu pasaporte de explorador</h2>
            <p className="text-xs text-zinc-400">
              Cada país que visitas recibe un sello. Completa el mapa para convertirte en ciudadano del mundo.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-black tabular-nums text-amber-300">{discovered.size}</div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">{total} países</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black tabular-nums text-zinc-200">
              {Math.round((discovered.size / Math.max(1, total)) * 100)}%
            </div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">completado</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CONTINENT_ORDER.map((cont) => {
          const meta = CONTINENT_META[cont];
          const list = COUNTRIES.filter((c) => c.continent === cont);
          const done = list.filter((c) => discovered.has(c.cca2)).length;
          return (
            <section key={cont} className="card flex flex-col gap-3 p-5">
              <header className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-zinc-100">
                  <span>{meta.emoji}</span> {meta.label}
                </h3>
                <span className="text-xs font-bold" style={{ color: meta.hex }}>
                  {done}/{list.length}
                </span>
              </header>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(done / Math.max(1, list.length)) * 100}%`, background: meta.hex }}
                />
              </div>
              <div className="nice-scroll flex flex-wrap gap-2">
                {list.map((c: Country) => {
                  const has = discovered.has(c.cca2);
                  return (
                    <button
                      key={c.cca2}
                      onClick={() => (has ? onOpenCountry(c.cca2) : undefined)}
                      className={`group flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${
                        has
                          ? "border-white/10 bg-white/[0.05] hover:border-amber-300/40"
                          : "border-dashed border-white/15 opacity-45"
                      }`}
                      title={has ? `${c.nameES} — abrir` : `${c.nameES} — aún sin descubrir`}
                    >
                      {has ? (
                        <>
                          <Flag cca2={c.cca2} className="h-4 w-6 rounded-[2px] object-cover" />
                          <span className="font-semibold text-zinc-200">{c.nameES}</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-block h-4 w-6 rounded-[2px] border border-white/20 bg-white/5" />
                          <span className="text-zinc-400">{c.nameES}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              {done === 0 && (
                <button
                  onClick={onExplore}
                  className="btn-press mt-auto rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200"
                >
                  🗺️ Explorar {meta.label}
                </button>
              )}
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onResetConfirm}
          className="btn-press rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-500 transition hover:border-rose-400/40 hover:text-rose-300"
        >
          ♻️ Reiniciar progreso
        </button>
      </div>
    </div>
  );
}