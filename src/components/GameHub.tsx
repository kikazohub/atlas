"use client";

import { useMemo, useState } from "react";
import { COUNTRIES, type Country } from "@/lib/countries";
import type { GameResult } from "@/lib/game";
import { playSelect } from "@/lib/client/sound";
import { ContinentChips, type Scope } from "./ContinentChips";
import { QuizGame } from "./QuizGame";
import { FindOnMapGame } from "./FindOnMapGame";

type GameId = "find" | "flags" | "capitals";

const GAMES: { id: GameId; emoji: string; title: string; desc: string; rounds: string }[] = [
  {
    id: "find",
    emoji: "🗺️",
    title: "¿Dónde está…?",
    desc: "Te decimos un país y debes localizarlo (click) en el mapa del mundo.",
    rounds: "6 rondas",
  },
  {
    id: "flags",
    emoji: "🚩",
    title: "Banderas",
    desc: "Identifica banderas y sus países en velocidad con 4 opciones.",
    rounds: "10 rondas",
  },
  {
    id: "capitals",
    emoji: "🏙️",
    title: "Capitales",
    desc: "Relaciona cada país con su capital, ¡y al revés!",
    rounds: "10 rondas",
  },
];

export function GameHub({
  discovered,
  soundEnabled,
  onFound,
  onEnd,
}: {
  discovered: Set<string>;
  soundEnabled: boolean;
  onFound: (cca2: string) => void;
  onEnd: (r: GameResult) => void;
}) {
  const [scope, setScope] = useState<Scope>("world");
  const [game, setGame] = useState<GameId | null>(null);

  const pool = useMemo<Country[]>(
    () => (scope === "world" ? COUNTRIES : COUNTRIES.filter((c) => c.continent === scope)),
    [scope],
  );

  function start(id: GameId) {
    if (soundEnabled) playSelect();
    setGame(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-zinc-50">🎮 Centro de juegos</h2>
          <p className="text-xs text-zinc-400">Elige un continente para enfocar tu aprendizaje.</p>
        </div>
        {game !== null && (
          <button
            onClick={() => setGame(null)}
            className="btn-press rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300"
          >
            ✕ Volver al hub
          </button>
        )}
      </div>

      <ContinentChips selected={scope} onChange={setScope} />

      {game === null ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => start(g.id)}
              className="card btn-press group flex flex-col gap-3 p-5 text-left transition hover:border-amber-300/30"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl transition group-hover:scale-110">
                {g.emoji}
              </span>
              <div>
                <h3 className="text-base font-extrabold text-zinc-50 group-hover:text-amber-200">
                  {g.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{g.desc}</p>
              </div>
              <span className="mt-auto rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-center text-xs font-bold text-amber-200">
                ▶ Jugar · {g.rounds}
              </span>
            </button>
          ))}
        </div>
      ) : game === "find" ? (
        <FindOnMapGame
          pool={pool}
          discovered={discovered}
          soundEnabled={soundEnabled}
          onFound={onFound}
          onEnd={(r) => {
            onEnd(r);
            setGame(null);
          }}
          onClose={() => setGame(null)}
        />
      ) : game === "flags" ? (
        <QuizGame
          title="Banderas"
          emoji="🚩"
          subtitle={`Identifica las banderas · ${pool.length} países disponibles`}
          pool={pool}
          kinds={["flag-to-country", "country-to-flag"]}
          rounds={10}
          soundEnabled={soundEnabled}
          resultKind="flags"
          onEnd={(r) => {
            onEnd(r);
            setGame(null);
          }}
          onClose={() => setGame(null)}
        />
      ) : (
        <QuizGame
          title="Capitales"
          emoji="🏙️"
          subtitle={`País ↔ capital · ${pool.length} países disponibles`}
          pool={pool}
          kinds={["country-to-capital", "capital-to-country"]}
          rounds={10}
          soundEnabled={soundEnabled}
          resultKind="capitals"
          onEnd={(r) => {
            onEnd(r);
            setGame(null);
          }}
          onClose={() => setGame(null)}
        />
      )}
    </div>
  );
}