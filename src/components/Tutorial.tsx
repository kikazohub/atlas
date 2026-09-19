"use client";

import { useEffect, useState } from "react";
import { playSelect } from "@/lib/client/sound";

const STEPS = [
  {
    emoji: "🗺️",
    title: "Explora el mapa",
    text: "Haz clic en cualquier país para descubrirlo y leer su ficha: bandera, capital, población y más. Cada visita estampa tu pasaporte.",
  },
  {
    emoji: "🎮",
    title: "Juega y gana",
    text: "Encuentra países en el mapa, identifica banderas y capitales. Cada acierto suma XP, monedas 🪙 y medallas 🏅.",
  },
  {
    emoji: "📅",
    title: "Vuelve cada día",
    text: "El reto diario cambia cada fecha y tu racha 🔥 crece si juegas varios días seguidos. ¡El Atlas Mundial siempre tiene algo nuevo!",
  },
];

export function Tutorial({
  soundEnabled,
  onDone,
}: {
  soundEnabled: boolean;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else onDone();
      }
      if (e.key === "Escape") onDone();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onDone]);

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="card anim-pop-in flex w-full max-w-sm flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Bienvenido al Atlas
          </span>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-amber-300" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="anim-float-slow text-6xl">{s.emoji}</span>
          <h2 className="text-xl font-extrabold text-zinc-50">{s.title}</h2>
          <p className="text-sm leading-relaxed text-zinc-300">{s.text}</p>
        </div>

        <button
          onClick={() => {
            if (soundEnabled) playSelect();
            if (step < STEPS.length - 1) setStep((v) => v + 1);
            else onDone();
          }}
          className="btn-press rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-bold text-black"
        >
          {step < STEPS.length - 1 ? "Siguiente ➡" : "¡Comenzar aventura! 🚀"}
        </button>
        <button
          onClick={onDone}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Saltar introducción
        </button>
      </div>
    </div>
  );
}