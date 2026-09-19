"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { COUNTRIES, countryByCca2 } from "@/lib/countries";
import { dateKey, buildDailySpec, type DailySpec } from "@/lib/daily";
import {
  CoinsCorrect,
  CoinsNewCountry,
  CoinsPerfectBonus,
  XPCorrect,
  XPPerfectBonus,
  dailyStreakXpBonus,
  type GameResult,
} from "@/lib/game";
import { evaluateBadges } from "@/lib/badges";
import { levelFromXp } from "@/lib/levels";
import { updateDailyStreak, type StatsState, type StreakState } from "@/lib/save";
import {
  buildProgress,
  defaultStats,
  type AuthUser,
  type ProgressState,
} from "@/lib/progress";
import {
  playBadge,
  playLevelUp,
  playSelect,
  playStamp,
  playWin,
  speakNative,
} from "@/lib/client/sound";
import { BADGE_BY_ID } from "@/lib/badges";
import { TopBar } from "./TopBar";
import { NavTabs } from "./NavTabs";
import { MapView } from "./MapView";
import { GameHub } from "./GameHub";
import { DailyChallenge } from "./DailyChallenge";
import { PassportView } from "./PassportView";
import { BadgesGallery } from "./BadgesGallery";
import { Tutorial } from "./Tutorial";
import { AuthScreen } from "./AuthScreen";

export type View = "map" | "games" | "daily" | "passport";

interface Toast {
  id: number;
  emoji: string;
  title: string;
  desc?: string;
}

interface BadgeStatsSnapshot {
  seenCount: number;
  seenByContinent: Record<string, number>;
  continentTotal: Record<string, number>;
  xp: number;
  dailyStreak: number;
  dailyDone: number;
  gameStreakMax: number;
  gamesPlayed: number;
  perfectGames: number;
  capitalsCorrect: number;
  flagsCorrect: number;
  findCorrect: number;
}

export function AtlasApp() {
  const [ready, setReady] = useState(false);

  const [view, setView] = useState<View>("map");
  const [selected, setSelected] = useState<string | null>(null);

  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [xp, setXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(5);
  const [badges, setBadges] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<StreakState>({ last: "", count: 0, max: 0 });
  const [stats, setStats] = useState<StatsState>(defaultStats);
  const [daily, setDaily] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [resetAsk, setResetAsk] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bonusGivenToday, setBonusGivenToday] = useState(false);
  const [auth, setAuth] = useState<AuthUser | null | "loading">("loading");
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(false);

  const toastSeq = useRef(0);
  const lastSync = useRef("");
  const today = dateKey();
  const spec: DailySpec = useMemo(() => buildDailySpec(today), [today]);
  const dailyDone = !!daily[today];

  /* ----- cuenta y sincronización con servidor ----- */
  const loadFromServer = useCallback(() => {
    return fetch("/api/me", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as {
          user: AuthUser;
          progress: ProgressState | null;
        };
      })
      .catch(() => null);
  }, []);

  const applyProgressData = useCallback(
    (p: ProgressState) => {
      setDiscovered(new Set(p.seen));
      setXp(p.xp);
      setCoins(p.coins);
      setBadges(new Set(p.badges));
      setStreak(updateDailyStreak(p.streak, today));
      setStats(p.stats);
      setDaily(p.daily);
      setSoundEnabled(p.soundEnabled);
      setBonusGivenToday(p.bonusDay === today);
      setTutorialSeen(p.tutorialSeen);
      if (!p.tutorialSeen) setTutorialOpen(true);
      lastSync.current = JSON.stringify(p);
    },
    [today],
  );

  const handleAuthed = useCallback(
    (user: AuthUser) => {
      setAuth("loading");
      void loadFromServer().then((d) => {
        setAuth(d?.user ?? user);
        if (d?.progress) {
          applyProgressData(d.progress);
        } else {
          setTutorialOpen(true);
          lastSync.current = "";
        }
        setLoadedOnce(true);
        setReady(true);
      });
    },
    [loadFromServer, applyProgressData],
  );

  /* ----- arranque: cargar sesión y progreso ----- */
  useEffect(() => {
    const t = setTimeout(() => {
      void loadFromServer().then((d) => {
        if (d) {
          setAuth(d.user);
          if (d.progress) {
            applyProgressData(d.progress);
          } else {
            setTutorialOpen(true);
            lastSync.current = "";
          }
        } else {
          setAuth(null);
        }
        setLoadedOnce(true);
        setReady(true);
      });
    }, 0);
    return () => clearTimeout(t);
  }, [loadFromServer, applyProgressData]);

  const progressPayload = useMemo<ProgressState>(
    () =>
      buildProgress(
        discovered,
        xp,
        coins,
        badges,
        streak,
        stats,
        daily,
        soundEnabled,
        bonusGivenToday ? today : "",
        tutorialSeen,
      ),
    [
      discovered,
      xp,
      coins,
      badges,
      streak,
      stats,
      daily,
      soundEnabled,
      bonusGivenToday,
      tutorialSeen,
      today,
    ],
  );

  /* ----- guardar en servidor (debounce + flush al salir) ----- */
  useEffect(() => {
    if (!loadedOnce || auth === "loading" || !auth) return;
    const json = JSON.stringify(progressPayload);
    if (json === lastSync.current) return;
    lastSync.current = json;
    const t = setTimeout(() => {
      void fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json,
      }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [progressPayload, auth, loadedOnce]);

  useEffect(() => {
    if (!loadedOnce || auth === "loading" || !auth) return;
    const json = JSON.stringify(progressPayload);
    const flush = () => {
      if (json === lastSync.current) return;
      lastSync.current = json;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/progress",
          new Blob([json], { type: "application/json" }),
        );
      } else {
        void fetch("/api/progress", {
          method: "PUT",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: json,
        }).catch(() => {});
      }
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [progressPayload, auth, loadedOnce]);

  const pushToast = useCallback((emoji: string, title: string, desc?: string) => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t.slice(-3), { id, emoji, title, desc }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  /* ----- recompensas centrales ----- */
  const commit = useCallback(
    (d: {
      xp?: number;
      coins?: number;
      discoveredAdd?: string[];
      stats?: Partial<StatsState>;
    }) => {
      const lvlBefore = levelFromXp(xp).level;

      let nextDiscovered = discovered;
      if (d.discoveredAdd?.length) {
        const added = d.discoveredAdd.filter((c) => !discovered.has(c));
        if (added.length) nextDiscovered = new Set([...discovered, ...added]);
      }
      setDiscovered(nextDiscovered);

      const nextXp = Math.max(0, xp + (d.xp ?? 0));
      const nextCoins = Math.max(0, coins + (d.coins ?? 0));
      setXp(nextXp);
      setCoins(nextCoins);

      let nextStats = stats;
      if (d.stats) {
        nextStats = { ...stats, ...d.stats };
        setStats(nextStats);
      }

      const nextBadges = evaluateBadges(snapshotOf(nextDiscovered, nextXp, streak, nextStats));
      const newly = [...nextBadges].filter((b) => !badges.has(b));
      if (newly.length) {
        setBadges(new Set(nextBadges));
        if (soundEnabled) playBadge();
        const first = BADGE_BY_ID.get(newly[0]);
        pushToast(
          `${first?.emoji ?? "🏅"} ¡Medalla nueva!`,
          (newly.map((b) => BADGE_BY_ID.get(b)?.title ?? b)).join(", "),
        );
      }

      if (levelFromXp(nextXp).level > lvlBefore) {
        if (soundEnabled) playLevelUp();
        pushToast("⭐ ¡Subiste de nivel!", `Nivel ${levelFromXp(nextXp).level}`);
      }
    },
    [xp, coins, discovered, stats, streak, badges, soundEnabled, pushToast],
  );

  const speakCountry = useCallback((cca2: string) => {
    const c = countryByCca2(cca2);
    if (c) speakNative(c.nativeName, c.nativeLang);
  }, []);

  const handleMapSelect = useCallback(
    (cca2: string) => {
      if (selected === cca2) {
        setSelected(null);
        if (soundEnabled) playSelect();
        return;
      }
      setSelected(cca2);
      if (soundEnabled) playSelect();
      speakCountry(cca2);
      if (!discovered.has(cca2)) {
        pushToast(`🛂 Nuevo sello en tu pasaporte`, `${COUNTRY_NAME(cca2)} · +${CoinsNewCountry} 🪙`);
        if (soundEnabled) playStamp();
        commit({ discoveredAdd: [cca2], coins: CoinsNewCountry });
      }
    },
    [selected, discovered, soundEnabled, pushToast, commit, speakCountry],
  );

  const handleViewChange = useCallback((v: View) => {
    if (v !== "map") setSelected(null);
    setView(v);
  }, []);

  const handleRandom = useCallback(() => {
    const c = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    handleMapSelect(c.cca2);
  }, [handleMapSelect]);

  const handleFound = useCallback(
    (cca2: string) => {
      if (discovered.has(cca2)) return;
      pushToast(`🛂 ¡Nuevo sello!`, `${COUNTRY_NAME(cca2)} · +${CoinsNewCountry} 🪙`);
      if (soundEnabled) playStamp();
      commit({ discoveredAdd: [cca2], coins: CoinsNewCountry });
    },
    [discovered, soundEnabled, pushToast, commit],
  );

  const handleGameEnd = useCallback(
    (kind: GameResult["kind"], r: GameResult) => {
      let xpGain = r.correct * XPCorrect + (r.perfect ? XPPerfectBonus : 0);
      if (!bonusGivenToday) {
        xpGain += dailyStreakXpBonus(streak.count);
        setBonusGivenToday(true);
      }
      let coinGain = r.correct * CoinsCorrect + (r.perfect ? CoinsPerfectBonus : 0);

      const statsDelta: Partial<StatsState> = {
        gamesPlayed: stats.gamesPlayed + 1,
        gameStreakMax: Math.max(stats.gameStreakMax, r.maxStreak),
        perfectGames: stats.perfectGames + (r.perfect ? 1 : 0),
      };
      if (kind === "flags") statsDelta.flagsCorrect = stats.flagsCorrect + r.correct;
      if (kind === "capitals") statsDelta.capitalsCorrect = stats.capitalsCorrect + r.correct;
      if (kind === "find") statsDelta.findCorrect = stats.findCorrect + r.correct;

      const dayKey = dateKey();
      const isDaily = kind === "daily" && !daily[dayKey];
      if (isDaily) {
        statsDelta.dailyDone = stats.dailyDone + 1;
        const spesq = buildDailySpec(dayKey);
        xpGain += spesq.bonusXp;
        coinGain += spesq.bonusCoins;
        setDaily((prev) => ({ ...prev, [dayKey]: true }));
        if (soundEnabled) playWin();
        pushToast(
          "📅 ¡Reto diario completado!",
          `+${spesq.bonusXp} XP · +${spesq.bonusCoins} 🪙 · racha 🔥${streak.count}`,
        );
      }

      if (r.perfect) {
        pushToast("💯 ¡Partida perfecta!", `+${XPPerfectBonus} XP extra · +${CoinsPerfectBonus} 🪙`);
      }

      commit({ xp: xpGain, coins: coinGain, stats: statsDelta });
    },
    [bonusGivenToday, streak, stats, daily, soundEnabled, pushToast, commit],
  );

  const handleDailyEnd = useCallback((r: GameResult) => handleGameEnd("daily", r), [handleGameEnd]);

  const handleReset = useCallback(() => {
    const next = buildProgress(
      new Set(),
      0,
      5,
      new Set(),
      { last: today, count: 1, max: 1 },
      defaultStats,
      {},
      soundEnabled,
      "",
      false,
    );
    const json = JSON.stringify(next);
    lastSync.current = json;
    void fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: json,
    }).catch(() => {});
    setDiscovered(new Set());
    setXp(0);
    setCoins(5);
    setBadges(new Set());
    setStreak({ last: today, count: 1, max: 1 });
    setStats(defaultStats);
    setDaily({});
    setBonusGivenToday(false);
    setTutorialSeen(false);
    setSelected(null);
    setView("map");
    pushToast("♻️ Progreso reiniciado", "¡Listo para empezar de cero!");
  }, [today, soundEnabled, pushToast]);

  const handleLogout = useCallback(() => {
    void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    lastSync.current = "";
    setAuth(null);
    setLoadedOnce(false);
    setDiscovered(new Set());
    setXp(0);
    setCoins(5);
    setBadges(new Set());
    setStreak({ last: "", count: 0, max: 0 });
    setStats(defaultStats);
    setDaily({});
    setSoundEnabled(true);
    setBonusGivenToday(false);
    setTutorialSeen(false);
    setTutorialOpen(false);
    setSelected(null);
    setView("map");
  }, []);

  if (!ready || auth === "loading") {
    return (
      <div className="card flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="anim-float-slow text-4xl">🌍</span>
          <p className="anim-fade-up text-sm text-zinc-400">Abriendo tu pasaporte…</p>
        </div>
      </div>
    );
  }

  if (!auth) {
    return <AuthScreen onAuthed={handleAuthed} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <TopBar
        xp={xp}
        coins={coins}
        streak={streak.count}
        discoveredCount={discovered.size}
        total={COUNTRIES.length}
        badgesCount={badges.size}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        onOpenBadges={() => setBadgesOpen(true)}
        onReset={() => setResetAsk(true)}
        username={auth.username}
        onLogout={handleLogout}
      />

      <NavTabs view={view} onChange={handleViewChange} dailyPending={!dailyDone} />

      {view === "map" && (
        <MapView
          discovered={discovered}
          selected={selected}
          onSelect={handleMapSelect}
          onRandom={handleRandom}
          discoveredCount={discovered.size}
        />
      )}

      {view === "games" && (
        <GameHub
          discovered={discovered}
          soundEnabled={soundEnabled}
          onFound={handleFound}
          onEnd={(r) => handleGameEnd(r.kind, r)}
        />
      )}

      {view === "daily" && (
        <DailyChallenge
          spec={spec}
          done={dailyDone}
          soundEnabled={soundEnabled}
          onEnd={handleDailyEnd}
          onGoGames={() => setView("games")}
        />
      )}

      {view === "passport" && (
        <PassportView
          discovered={discovered}
          onOpenCountry={(cca2) => {
            speakCountry(cca2);
            setSelected(cca2);
            setView("map");
          }}
          onExplore={() => setView("map")}
          onResetConfirm={() => setResetAsk(true)}
        />
      )}

      <footer className="pt-2 text-center text-[11px] text-zinc-600">
        Atlas Mundial · aprende geografía jugando · {COUNTRIES.length} países · tu
        progreso se guarda en tu cuenta
      </footer>

      {tutorialOpen && (
        <Tutorial
          soundEnabled={soundEnabled}
          onDone={() => {
            setTutorialOpen(false);
            setTutorialSeen(true);
          }}
        />
      )}

      {badgesOpen && <BadgesGallery owned={badges} onClose={() => setBadgesOpen(false)} />}

      {resetAsk && (
        <div
          className="fixed inset-0 z-[130] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setResetAsk(false)}
        >
          <div
            className="card anim-pop-in w-full max-w-sm p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-4xl">♻️</span>
            <h3 className="mt-2 text-lg font-extrabold text-zinc-50">¿Reiniciar todo tu progreso?</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Se borrarán sellos, XP, monedas, medallas, racha, estadísticas y el reto diario. Esta
              acción no se puede deshacer.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setResetAsk(false);
                  handleReset();
                }}
                className="btn-press flex-1 rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-bold text-white"
              >
                Sí, reiniciar
              </button>
              <button
                onClick={() => setResetAsk(false)}
                className="btn-press flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-72 flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="anim-pop-in card pointer-events-auto flex items-start gap-3 p-3">
            <span className="text-2xl">{t.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-100">{t.title}</p>
              {t.desc && <p className="text-xs text-zinc-400">{t.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- helpers módulo ---------- */
function COUNTRY_NAME(cca2: string): string {
  return COUNTRIES.find((c) => c.cca2 === cca2)?.nameES ?? cca2;
}

function snapshotOf(
  discovered: Set<string>,
  xp: number,
  streak: StreakState,
  stats: StatsState,
): BadgeStatsSnapshot {
  const seenByContinent: Record<string, number> = {};
  const continentTotal: Record<string, number> = {};
  for (const c of COUNTRIES) {
    continentTotal[c.continent] = (continentTotal[c.continent] ?? 0) + 1;
    if (discovered.has(c.cca2)) {
      seenByContinent[c.continent] = (seenByContinent[c.continent] ?? 0) + 1;
    }
  }
  return {
    seenCount: discovered.size,
    seenByContinent,
    continentTotal,
    xp,
    dailyStreak: streak.count,
    dailyDone: stats.dailyDone,
    gameStreakMax: stats.gameStreakMax,
    gamesPlayed: stats.gamesPlayed,
    perfectGames: stats.perfectGames,
    capitalsCorrect: stats.capitalsCorrect,
    flagsCorrect: stats.flagsCorrect,
    findCorrect: stats.findCorrect,
  };
}