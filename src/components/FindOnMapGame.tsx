"use client";

import { useMemo, useState } from "react";
import type { Country } from "@/lib/countries";
import { shuffle, type GameResult } from "@/lib/game";
import { playCorrect, playError, playStamp, playWin } from "@/lib/client/sound";
import { WorldMap, type FlashState } from "./WorldMap";
import { Flag } from "./Flag";

const ROUNDS = 6;
const HEARTS = 3;

export function FindOnMapGame({
  pool,
  discovered,
  soundEnabled,
  onFound,
  onEnd,
  onClose,
}: {
  pool: Country[];
  discovered: Set<string>;
  soundEnabled: boolean;
  onFound: (cca2: string) => void;
  onEnd: (r: GameResult) => void;
  onClose: () => void;
}) {
  const targets = useMemo<Country[]>(
    () => shuffle(pool).slice(0, ROUNDS),
    [pool],
  );

  const [round, setRound] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"playing" | "success" | "fail">("playing");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [flash, setFlash] = useState<FlashState | null>(null);
  const [done, setDone] = useState(false);

  const target = targets[round];
  const heartsLeft = HEARTS - attempts;

  function onMapSelect(cca2: string) {
    if (status !== "playing" || !target) return;
    const ok = cca2 === target.cca2;
    if (ok) {
      setFlash((prev) => ({ cca2, ok: true, token: (prev?.token ?? 0) + 1 }));
      const pts = attempts === 0 ? 10 : attempts === 1 ? 6 : 3;
      setScore((s) => s + pts);
      setCorrect((c) => c + 1);
      if (attempts === 0) {
        setStreak((s) => {
          const nx = s + 1;
          setMaxStreak((m) => Math.max(m, nx));
          return nx;
        });
      }
      setStatus("success");
      onFound(cca2);
      if (soundEnabled) playCorrect();
    } else {
      setFlash((prev) => ({ cca2, ok: false, token: (prev?.token ?? 0) + 1 }));
      setStreak(0);
      if (soundEnabled) playError();
      if (attempts + 1 >= HEARTS) {
        setStatus("fail");
        onFound(target.cca2);
        if (soundEnabled) playStamp();
      } else {
        setAttempts((a) => a + 1);
      }
    }
  }

  function next() {
    if (round + 1 >= targets.length) {
      setDone(true);
      if (soundEnabled) playWin();
      onEnd({
        kind: "find",
        correct,
        total: targets.length,
        perfect: correct === targets.length,
        maxStreak,
      });
    } else {
      setRound((r) => r + 1);
      setAttempts(0);
      setStatus("playing");
      setFlash(null);
    }
  }

  if (targets.length === 0) {
    return (
      <div className="card flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-4xl">🗺️</span>
        <p className="text-sm text-zinc-400">No hay países para este filtro.</p>
        <button onClick={onClose} className="btn-press rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
          Volver
        </button>
      </div>
    );
  }

  if (done || !target) {
    const pct = Math.round((correct / targets.length) * 100);
    const medal = pct === 100 ? "💯" : pct >= 66 ? "🌟" : "👍";
    const verdict =
      pct === 100
        ? "¡Ojo de águila! Aciertas todos en el mapa."
        : pct >= 66
          ? "¡Buen manejo del mapa del mundo!"
          : "Sigue explorando y verás el mapa con claridad.";
    return (
      <div className="card anim-pop-in mx-auto flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <span className="anim-twinkle text-6xl">{medal}</span>
        <div>
          <h3 className="text-xl font-extrabold text-zinc-50">¡Expedición terminada!</h3>
          <p className="mt-1 text-xs text-zinc-400">{verdict}</p>
        </div>
        <div className="flex items-end gap-6">
          <div>
            <div className="text-4xl font-black tabular-nums text-amber-300">{correct}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-zinc-500">países</div>
          </div>
          <div className="pb-1 text-3xl text-zinc-600">/</div>
          <div>
            <div className="text-4xl font-black tabular-nums text-zinc-200">{targets.length}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-zinc-500">rondas</div>
          </div>
        </div>
        <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-300">
          🧭 Puntos mapa: <b className="text-sky-300">{score}</b> · 🔥 Racha máx: <b className="text-orange-300">{maxStreak}</b>
        </p>
        <div className="flex w-full gap-2">
          <button
            onClick={onClose}
            className="btn-press flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-200"
          >
            Cerrar ✕
          </button>
          <button
            onClick={() => onClose()}
            className="btn-press flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-black"
          >
            Volver al hub 🧭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card anim-pop-in flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-xl">
            🗺️
          </span>
          <div>
            <h3 className="text-base font-extrabold text-zinc-50">
              ¿Dónde está <b className="text-amber-200">{target.nameES}</b>?
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="inline-block h-4 w-6 overflow-hidden rounded">
                <Flag cca2={target.cca2} className="h-full w-full object-cover" />
              </span>
              Capital: {target.capital} · Haz clic en el mapa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
            Ronda {round + 1}/{targets.length}
          </span>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
            {heartsLeft > 0 ? "❤️".repeat(heartsLeft) + "🖤".repeat(HEARTS - heartsLeft) : "💀 Sin intentos"}
          </span>
          {streak > 1 && (
            <span className="rounded-lg border border-orange-300/20 bg-orange-300/10 px-2.5 py-1 text-xs text-orange-200">
              🔥 Racha {streak}
            </span>
          )}
        </div>
      </div>

      {status === "playing" && (
        <WorldMap
          key={`find-${round}`}
          discovered={discovered}
          selected={null}
          findTarget={target.cca2}
          flash={flash}
          onSelect={onMapSelect}
        />
      )}

      {(status === "success" || status === "fail") && (
        <div className="card anim-pop-in flex flex-col items-center gap-3 p-6 text-center">
          <span className="text-5xl">{status === "success" ? "🎉" : "💔"}</span>
          <p className="text-lg font-extrabold text-zinc-50">
            {status === "success"
              ? `¡Era ${target.nameES}! +${attempts === 0 ? 10 : attempts === 1 ? 6 : 3} puntos`
              : `Era ${target.nameES}`}
          </p>
          <p className="text-xs text-zinc-400">
            {status === "success"
              ? "Sello añadido a tu pasaporte (si aún no lo tenías)."
              : "Agotaste los intentos. Su sello se ha estampado igualmente."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={next}
              className="btn-press rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-black"
            >
              {round + 1 >= targets.length ? "Ver resultado 🏁" : "Siguiente destino ➡"}
            </button>
            <button
              onClick={onClose}
              className="btn-press rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}