import type { DailyState, StatsState, StreakState } from "@/lib/save";

export interface AuthUser {
  id: number;
  username: string;
}

export interface ProgressState {
  v: 1;
  seen: string[];
  xp: number;
  coins: number;
  badges: string[];
  streak: StreakState;
  stats: StatsState;
  daily: DailyState;
  soundEnabled: boolean;
  bonusDay: string;
  tutorialSeen: boolean;
}

export const defaultStats: StatsState = {
  gamesPlayed: 0,
  perfectGames: 0,
  gameStreakMax: 0,
  capitalsCorrect: 0,
  flagsCorrect: 0,
  findCorrect: 0,
  dailyDone: 0,
};

export const EMPTY_PROGRESS: ProgressState = {
  v: 1,
  seen: [],
  xp: 0,
  coins: 5,
  badges: [],
  streak: { last: "", count: 0, max: 0 },
  stats: defaultStats,
  daily: {},
  soundEnabled: true,
  bonusDay: "",
  tutorialSeen: false,
};

export function buildProgress(
  discovered: Set<string>,
  xp: number,
  coins: number,
  badges: Set<string>,
  streak: StreakState,
  stats: StatsState,
  daily: DailyState,
  soundEnabled: boolean,
  bonusDay: string,
  tutorialSeen: boolean,
): ProgressState {
  return {
    v: 1,
    seen: [...discovered],
    xp,
    coins,
    badges: [...badges],
    streak,
    stats,
    daily,
    soundEnabled,
    bonusDay,
    tutorialSeen,
  };
}

export function sanitizeProgress(raw: unknown): ProgressState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const num = (x: unknown, fb: number) =>
    typeof x === "number" && Number.isFinite(x) ? Math.max(0, x) : fb;
  const bool = (x: unknown, fb: boolean) => (typeof x === "boolean" ? x : fb);
  const arrStr = (x: unknown): string[] | null =>
    Array.isArray(x) && x.every((v) => typeof v === "string") ? x : null;

  const seen = arrStr(r.seen);
  const badges = arrStr(r.badges);
  if (!seen || !badges) return null;

  if (typeof r.streak !== "object" || r.streak === null) return null;
  if (typeof r.stats !== "object" || r.stats === null) return null;
  const st = r.streak as Record<string, unknown>;
  const sa = r.stats as Record<string, unknown>;

  const daily: DailyState = {};
  if (typeof r.daily === "object" && r.daily !== null) {
    for (const [k, v] of Object.entries(r.daily as Record<string, unknown>)) {
      if (typeof v === "boolean") daily[k] = v;
    }
  }

  return {
    v: 1,
    seen,
    xp: num(r.xp, 0),
    coins: num(r.coins, 0),
    badges,
    streak: {
      last: typeof st.last === "string" ? st.last : "",
      count: num(st.count, 0),
      max: num(st.max, 0),
    },
    stats: {
      gamesPlayed: num(sa.gamesPlayed, 0),
      perfectGames: num(sa.perfectGames, 0),
      gameStreakMax: num(sa.gameStreakMax, 0),
      capitalsCorrect: num(sa.capitalsCorrect, 0),
      flagsCorrect: num(sa.flagsCorrect, 0),
      findCorrect: num(sa.findCorrect, 0),
      dailyDone: num(sa.dailyDone, 0),
    },
    daily,
    soundEnabled: bool(r.soundEnabled, true),
    bonusDay: typeof r.bonusDay === "string" ? r.bonusDay : "",
    tutorialSeen: bool(r.tutorialSeen, false),
  };
}