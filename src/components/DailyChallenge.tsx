"use client";

import type { DailySpec } from "@/lib/daily";
import type { GameResult } from "@/lib/game";
import { QuizGame } from "./QuizGame";

export function DailyChallenge({
  spec,
  done,
  soundEnabled,
  onEnd,
  onGoGames,
}: {
  spec: DailySpec;
  done: boolean;
  soundEnabled: boolean;
  onEnd: (r: GameResult) => void;
  onGoGames: () => void;
}) {
  if (done) {
    return (
      <div className="card anim-pop-in mx-auto flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <span className="anim-twinkle text-6xl">🧳</span>
        <div>
          <h2 className="text-xl font-extrabold text-zinc-50">¡Reto de hoy completado!</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Mañana habrá un reto nuevo. Mantén tu racha encendida 🔥
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2">
          <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-3 text-center">
            <div className="text-xl font-black text-amber-300">+{spec.bonusXp} XP</div>
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">bonus</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
            <div className="text-xl font-black text-amber-300">+{spec.bonusCoins} 🪙</div>
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">bonus</div>
          </div>
        </div>
        <button
          onClick={onGoGames}
          className="btn-press w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-bold text-black"
        >
          🎮 Seguir jugando
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-xl">
            📅
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-50">Reto diario</h2>
            <p className="text-xs text-zinc-400">
              {spec.questions.length} preguntas únicas para hoy · una sola oportunidad.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">
            +{spec.bonusXp} XP · +{spec.bonusCoins} 🪙
          </span>
        </div>
      </div>

      <QuizGame
        fixedQuestions={spec.questions}
        title="Reto diario"
        emoji="📅"
        subtitle="¡Solo una oportunidad por día!"
        pool={[]}
        kinds={[]}
        rounds={spec.questions.length}
        soundEnabled={soundEnabled}
        resultKind="daily"
        onEnd={onEnd}
        onClose={onGoGames}
      />
    </div>
  );
}