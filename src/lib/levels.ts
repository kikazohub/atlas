const BASE = 100;
const STEP = 60;

export interface LevelInfo {
  level: number;
  current: number;
  needed: number;
  total: number;
  pct: number;
}

const cumulative = (level: number): number => {
  if (level <= 1) return 0;
  let total = BASE;
  for (let l = 2; l < level; l++) total += BASE + (l - 1) * STEP;
  return total;
};

export const levelFromXp = (xp: number): LevelInfo => {
  let level = 1;
  let acc = 0;
  while (true) {
    const need = level === 1 ? BASE : BASE + (level - 1) * STEP;
    if (xp < acc + need || level >= 99) break;
    acc += need;
    level++;
  }
  const need = level === 1 ? BASE : BASE + (level - 1) * STEP;
  const current = xp - acc;
  const total = cumulative(level + 1);
  return {
    level,
    current,
    needed: need,
    total,
    pct: Math.max(0, Math.min(100, (current / need) * 100)),
  };
};

export const titleForLevel = (level: number): string => {
  if (level < 3) return "Novato";
  if (level < 6) return "Viajero";
  if (level < 10) return "Explorador";
  if (level < 15) return "Navegante";
  if (level < 20) return "Cartógrafo";
  if (level < 30) return "Geógrafo";
  if (level < 45) return "Erudito del mapa";
  return "Maestro del Atlas";
};