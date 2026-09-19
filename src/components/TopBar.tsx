"use client";

import { levelFromXp, titleForLevel } from "@/lib/levels";

export function TopBar({
  xp,
  coins,
  streak,
  discoveredCount,
  total,
  badgesCount,
  soundEnabled,
  onToggleSound,
  onOpenBadges,
  onReset,
  username,
  onLogout,
}: {
  xp: number;
  coins: number;
  streak: number;
  discoveredCount: number;
  total: number;
  badgesCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenBadges: () => void;
  onReset: () => void;
  username: string;
  onLogout: () => void;
}) {
  const lvl = levelFromXp(xp);

  return (
    <header className="anim-fade-up flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="anim-float-slow grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-2xl">
            🌍
          </div>
          <div>
            <h1 className="shimmer-text text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
              Atlas Mundial
            </h1>
            <p className="mt-1 text-[11px] text-zinc-400 sm:text-xs">
              Nivel {lvl.level} · <b className="text-amber-300">{titleForLevel(lvl.level)}</b>
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="btn-press flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-bold text-zinc-200">
            🪙 <b className="text-amber-300">{coins}</b>
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold ${
              streak > 0
                ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
                : "border-white/10 bg-white/5 text-zinc-400"
            }`}
            title="Días seguidos jugando"
          >
            🔥 <b>{streak}</b>
          </span>
          <button
            onClick={onOpenBadges}
            className="btn-press flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 text-sm font-semibold text-emerald-300"
            title="Ver tus medallas"
          >
            🏅 <b>{badgesCount}</b>
          </button>
          <button
            onClick={onToggleSound}
            className={`btn-press rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
              soundEnabled
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-zinc-400"
            }`}
            title="Sonido"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <button
            onClick={onLogout}
            className="btn-press flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-zinc-300 transition hover:border-rose-400/40 hover:text-rose-300"
            title="Cerrar sesión"
          >
            👤 <b className="max-w-[90px] truncate">{username}</b>
            <span className="text-xs text-zinc-500">Salir</span>
          </button>
          <button
            onClick={onReset}
            className="btn-press rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
            title="Reiniciar todo el progreso"
          >
            ♻️
          </button>
        </div>
      </div>

      <div className="card flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-lg font-black text-amber-300">
            {lvl.level}
          </div>
          <div className="min-w-[140px] flex-1 sm:min-w-[220px]">
            <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-400">
              <span>
                {lvl.current} / {lvl.needed} XP
              </span>
              <span>{Math.round(lvl.pct)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="anim-bar-grow h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${lvl.pct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="text-base">🛂</span>
          <span>
            <b className="text-zinc-100">{discoveredCount}</b>/{total} sellos
          </span>
          <span
            className="mx-1 hidden h-4 w-px bg-white/10 sm:block"
          />
          <span className="hidden sm:inline">
            Gana XP jugando y vuelve cada día para tu reto ✨
          </span>
        </div>
      </div>
    </header>
  );
}