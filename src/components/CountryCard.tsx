"use client";

import type { Country } from "@/lib/countries";
import { CONTINENT_META } from "@/lib/constants";
import { formatCompact } from "@/lib/constants";
import { Flag } from "./Flag";

function Row({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-right text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  );
}

export function CountryCard({
  country,
  discovered,
}: {
  country: Country;
  discovered: boolean;
}) {
  const meta = CONTINENT_META[country.continent];
  const area = country.area !== undefined ? formatCompact(country.area) : "?";
  const pop = country.population !== undefined ? formatCompact(country.population) : "?";
  const currencies = country.currencies
    .map((cu) => (cu.symbol ? `${cu.symbol} ${cu.name}` : cu.name))
    .join(" · ");

  return (
    <div className="card anim-pop-in flex flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-lg">
          <Flag cca2={country.cca2} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold leading-tight text-zinc-50">
              {country.nameES}
            </h2>
            {discovered && <span className="text-lg" title="Sello obtenido">✅</span>}
          </div>
          <p className="text-xs text-zinc-400">{country.nameEN}</p>
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{
              borderColor: `${meta.hex}66`,
              color: meta.hex,
              background: `${meta.hex}1a`,
            }}
          >
            {meta.emoji} {meta.label} · {country.subregion}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1">
        <Row label="Capital" value={`🏙️ ${country.capital}`} />
        {country.funFact && <Row label="Dato curioso" value={`💡 ${country.funFact}`} />}
        <Row label="Población" value={`👥 ${pop}`} />
        <Row label="Superficie" value={`🗺️ ${area} km²`} />
        <Row label="Moneda" value={`💰 ${currencies}`} />
        <Row label="Idiomas" value={`🗣️ ${country.languages.join(", ")}`} />
        <Row label="Gentilicio" value={`🧑‍🤝‍🧑 ${country.demonym}`} />
      </div>

      <p
        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
          discovered
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/[0.03] text-zinc-400"
        }`}
      >
        {discovered
          ? `🎫 Sello de ${country.nameES} añadido a tu pasaporte.`
          : "🛂 Aún no tienes este sello. ¡Explóralo para añadirlo a tu pasaporte!"}
      </p>
    </div>
  );
}