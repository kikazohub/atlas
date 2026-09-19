"use client";

import { COUNTRIES, countryByCca2 } from "@/lib/countries";
import { WorldMap } from "./WorldMap";
import { CountryCard } from "./CountryCard";

export function MapView({
  discovered,
  selected,
  onSelect,
  onRandom,
  discoveredCount,
}: {
  discovered: Set<string>;
  selected: string | null;
  onSelect: (cca2: string) => void;
  onRandom: () => void;
  discoveredCount: number;
}) {
  const country = selected ? countryByCca2(selected) : undefined;

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-zinc-400">
            🗺️ <b className="text-zinc-200">Navega el planeta</b> y haz clic en un
            país para descubrirlo. Usa Ctrl + rueda para acercar, arrastra para moverte.
          </p>
          <button
            onClick={onRandom}
            className="btn-press rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-orange-900/40"
            title="Descubre un país al azar"
          >
            🎲 País sorpresa
          </button>
        </div>

        <WorldMap
          discovered={discovered}
          selected={selected}
          findTarget={null}
          flash={null}
          onSelect={onSelect}
        />

        <p className="mt-2 text-center text-xs text-zinc-500">
          ✅ Sellos obtenidos:{" "}
          <b className="text-amber-300">{discoveredCount}</b> / {COUNTRIES.length}
        </p>
      </div>

      <aside className="w-full shrink-0 xl:w-[340px]">
        {country ? (
          <CountryCard country={country} discovered={discovered.has(country.cca2)} />
        ) : (
          <div className="card flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center xl:min-h-[460px]">
            <span className="text-5xl">🧭</span>
            <p className="text-sm leading-relaxed text-zinc-400">
              Selecciona un país en el mapa para ver su{" "}
              <b className="text-zinc-200">ficha completa</b>: bandera, capital,
              población, moneda y más.
            </p>
            <button
              onClick={onRandom}
              className="btn-press mt-1 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200"
            >
              🎲 Que el mapa decida
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}