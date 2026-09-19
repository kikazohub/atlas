"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/progress";

export function AuthScreen({
  onAuthed,
}: {
  onAuthed: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const u = username.trim();
    if (!u) {
      setError("Escribe tu usuario.");
      return;
    }
    if (mode === "register" && !/^[a-zA-Z0-9_]{3,20}$/.test(u)) {
      setError("El usuario debe tener entre 3 y 20 caracteres (letras, números o _).");
      return;
    }
    if (mode === "register" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password.length === 0) {
      setError("Escribe tu contraseña.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        user?: AuthUser;
        error?: string;
      };
      if (!res.ok || !data.user) {
        setBusy(false);
        setError(data.error ?? "No se pudo completar la acción.");
        return;
      }
      onAuthed(data.user);
    } catch {
      setBusy(false);
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="flex min-h-[480px] flex-1 items-center justify-center">
      <div className="card anim-pop-in w-full max-w-sm p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="anim-float-slow grid h-16 w-16 place-items-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-4xl">
            🌍
          </div>
          <h1 className="shimmer-text text-2xl font-extrabold tracking-tight">
            Atlas Mundial
          </h1>
          <p className="text-xs text-zinc-400">
            {mode === "login"
              ? "Entra para recuperar tu progreso."
              : "Crea tu cuenta de explorador."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
            Usuario
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="tu_usuario"
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
            Contraseña
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 pr-12 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-300/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:text-zinc-300"
                title={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-press mt-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition disabled:opacity-50"
          >
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="font-bold text-amber-300 hover:underline"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-bold text-amber-300 hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-600">
          Tu progreso se guarda en tu cuenta, para que lo recuperes cada vez que
          entres.
        </p>
      </div>
    </div>
  );
}