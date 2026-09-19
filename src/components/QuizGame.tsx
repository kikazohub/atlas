"use client";

import { useMemo, useState } from "react";
import type { Country } from "@/lib/countries";
import { countryByCca2 } from "@/lib/countries";
import {
  buildMixedQuestions,
  mulberry32,
  type GameResult,
  type Question,
  type QuestionKind,
} from "@/lib/game";
import { playCorrect, playError, playSelect, playWin } from "@/lib/client/sound";
import { Flag } from "./Flag";

export interface QuizGameProps {
  title: string;
  emoji: string;
  subtitle?: string;
  pool?: Country[];
  kinds: QuestionKind[];
  rounds?: number;
  fixedQuestions?: Question[];
  soundEnabled: boolean;
  resultKind?: GameResult["kind"];
  onEnd: (r: GameResult) => void;
  onClose: () => void;
}

function promptFor(q: Question): React.ReactNode {
  const subject = countryByCca2(q.promptCca2);
  if (!subject) return null;
  switch (q.kind) {
    case "flag-to-country":
      return (
        <>
          ¿De qué país es esta bandera?
          <span className="mx-2 inline-block h-10 w-16 align-middle overflow-hidden rounded-lg border border-white/15 shadow-md">
            <Flag cca2={q.promptCca2} className="h-full w-full object-cover" />
          </span>
        </>
      );
    case "country-to-flag":
      return <>¿Cuál es la {subject.flagEmoji} bandera de <b className="text-amber-200">{subject.nameES}</b>?</>;
    case "country-to-capital":
      return <>¿Cuál es la capital de <b className="text-amber-200">{subject.nameES}</b>?</>;
    case "capital-to-country":
      return <>¿A qué país pertenece la capital <b className="text-amber-200">{subject.capital}</b>?</>;
  }
}

function optionShowsFlag(q: Question): boolean {
  return q.kind === "country-to-flag";
}

export function QuizGame({
  title,
  emoji,
  subtitle,
  pool,
  kinds,
  rounds = 10,
  fixedQuestions,
  soundEnabled,
  onEnd,
  onClose,
  resultKind = "daily",
}: QuizGameProps) {
  const [seed, setSeed] = useState(0);
  const questions = useMemo<Question[]>(() => {
    if (fixedQuestions) return fixedQuestions;
    if (!pool) return [];
    const rng = seed === 0 ? Math.random : mulberry32(seed);
    return buildMixedQuestions(kinds, pool, rounds, rng) as Question[];
  }, [pool, kinds, rounds, fixedQuestions, seed]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q: Question | undefined = questions[idx];
  const isCorrect = picked !== null && q !== undefined && picked === q.correctIndex;

  function answer(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    if (i === q.correctIndex) {
      if (soundEnabled) playCorrect();
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const nx = s + 1;
        setMaxStreak((m) => Math.max(m, nx));
        return nx;
      });
    } else if (soundEnabled) {
      playError();
      setStreak(0);
    }
  }

  function next() {
    if (!q) return;
    if (idx + 1 >= questions.length) {
      setDone(true);
      if (soundEnabled) playWin();
      onEnd({
        kind: resultKind,
        correct,
        total: questions.length,
        perfect: correct === questions.length,
        maxStreak,
      });
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      if (soundEnabled) playSelect();
    }
  }

  function restart() {
    setSeed((s) => s + 1);
    setIdx(0);
    setPicked(null);
    setStreak(0);
    setMaxStreak(0);
    setCorrect(0);
    setDone(false);
  }

  if (questions.length === 0) {
    return (
      <div className="card flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-4xl">🛫</span>
        <p className="text-sm text-zinc-400">Preparando el juego…</p>
        <button onClick={onClose} className="btn-press rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
          Volver
        </button>
      </div>
    );
  }

  if (done || !q) {
    const pct = Math.round((correct / questions.length) * 100);
    const medal =
      pct === 100 ? "💯" : pct >= 80 ? "🌟" : pct >= 60 ? "🎉" : "👍";
    const verdict =
      pct === 100
        ? "¡Perfecto! Nadie te quita el título."
        : pct >= 80
          ? "¡Increíble! Casi imbatible."
          : pct >= 60
            ? "¡Buen trabajo! Sigue explorando."
            : "Buen intento. Vuelve a intentarlo y ganarás más XP.";
    return (
      <div className="card anim-pop-in mx-auto flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <span className="anim-twinkle text-6xl">{medal}</span>
        <div>
          <h3 className="text-xl font-extrabold text-zinc-50">¡Partida terminada!</h3>
          <p className="mt-1 text-xs text-zinc-400">{verdict}</p>
        </div>
        <div className="flex items-end gap-6">
          <div>
            <div className="text-4xl font-black tabular-nums text-amber-300">{correct}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-zinc-500">aciertos</div>
          </div>
          <div className="pb-1 text-3xl text-zinc-600">/</div>
          <div>
            <div className="text-4xl font-black tabular-nums text-zinc-200">{questions.length}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-zinc-500">preguntas</div>
          </div>
        </div>
        <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-300">
          🔥 Mejor racha: <b className="text-orange-300">{maxStreak}</b> · ✅ {Math.round((correct / Math.max(1, questions.length)) * 100)}% de precisión
        </p>
        <div className="flex w-full gap-2">
          <button
            onClick={restart}
            className="btn-press flex-1 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2.5 text-sm font-bold text-amber-200"
          >
            🔄 Jugar otra vez
          </button>
          <button
            onClick={onClose}
            className="btn-press flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-black"
          >
            Volver 🧭
          </button>
        </div>
</div>
    );
  }

  return (
    <div className="card anim-pop-in mx-auto w-full max-w-xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-50">
            {emoji} {title}
          </h3>
          {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
            {idx + 1}/{questions.length}
          </span>
          <span
            className={`rounded-lg border px-2.5 py-1 font-bold ${
              streak > 0 ? "border-orange-400/40 bg-orange-400/10 text-orange-300" : "border-white/10 bg-white/[0.03] text-zinc-500"
            }`}
          >
            🔥 {streak}
          </span>
        </div>
      </div>

      <p className="flex flex-wrap items-center gap-1 rounded-xl border-l-2 border-amber-300/50 bg-white/[0.04] px-3 py-3 text-sm leading-relaxed text-zinc-200">
        {promptFor(q)}
      </p>

      {picked === null ? (
        <div
          className={
            optionShowsFlag(q)
              ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
              : "flex flex-col gap-2"
          }
        >
          {q.options.map((opt, i) =>
            optionShowsFlag(q) ? (
              <button
                key={`${i}-${opt.cca2}`}
                onClick={() => answer(i)}
                className="btn-press overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 transition hover:border-amber-300/40 hover:bg-white/[0.08]"
              >
                <span className="block w-full overflow-hidden rounded-xl border border-white/10">
                  <Flag cca2={opt.cca2} className="h-12 w-full object-cover" />
                </span>
              </button>
            ) : (
              <button
                key={`${i}-${opt.cca2}-${opt.label}`}
                onClick={() => answer(i)}
                className="btn-press rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:bg-white/[0.07]"
              >
                {opt.label}
              </button>
            ),
          )}
        </div>
      ) : (
        <>
          <div
            className={`anim-pop-in flex items-center gap-2 rounded-xl p-3 text-sm font-bold ${
              isCorrect ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"
            }`}
          >
            {isCorrect ? (
              <span className="text-xl">🎉 +8 XP · +1 🪙</span>
            ) : (
              <>
                <span className="text-xl">💔</span>
                <span>
                  Era{" "}
                  {(() => {
                    const opt = q.options[q.correctIndex];
                    if (!opt) return null;
                    if (q.kind === "country-to-flag" || q.kind === "flag-to-country") {
                      return (
                        <>
                          <b>{opt.label}</b>{" "}
                          <span className="inline-block h-5 w-8 overflow-hidden rounded align-middle">
                            <Flag cca2={opt.cca2} className="h-full w-full object-cover" />
                          </span>
                        </>
                      );
                    }
                    return <b>{opt.label}</b>;
                  })()}
                </span>
              </>
            )}
          </div>
          <button
            onClick={next}
            className="btn-press ml-auto rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-black"
          >
            {idx + 1 >= questions.length ? "Ver resultado 🏁" : "Siguiente ➡"}
          </button>
        </>
      )}

      <button
        onClick={onClose}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:text-zinc-200"
      >
        Salir del juego
      </button>
    </div>
  );
}