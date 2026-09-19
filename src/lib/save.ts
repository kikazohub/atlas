export interface StreakState {
  last: string;
  count: number;
  max: number;
}

export interface StatsState {
  gamesPlayed: number;
  perfectGames: number;
  gameStreakMax: number;
  capitalsCorrect: number;
  flagsCorrect: number;
  findCorrect: number;
  dailyDone: number;
}

export interface DailyState {
  [dateKey: string]: boolean;
}

export function updateDailyStreak(
  prev: StreakState,
  today: string,
): StreakState {
  if (prev.last === today) return prev;
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const count = prev.last === yesterday ? prev.count + 1 : 1;
  return { last: today, count, max: Math.max(prev.max, count) };
}