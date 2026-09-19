import { COUNTRIES } from "./countries";
import {
  buildQuestion,
  mulberry32,
  shuffle,
  type Question,
} from "./game";

export const dateKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function seedFromKey(key: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface DailySpec {
  key: string;
  questions: Question[];
  bonusXp: number;
  bonusCoins: number;
}

const KINDS = [
  "flag-to-country",
  "country-to-flag",
  "country-to-capital",
  "capital-to-country",
] as const;

export function buildDailySpec(key: string = dateKey()): DailySpec {
  const rng = mulberry32(seedFromKey(key));
  const pool = shuffle(COUNTRIES, rng).slice(0, 40);

  const questions: Question[] = [];
  const kinds = shuffle([...KINDS], rng);
  const used = new Set<string>();
  for (const kind of kinds) {
    const q = buildQuestion(kind, pool, rng, used);
    if (q) questions.push(q);
    if (questions.length + 1 >= 5) break;
  }
  while (questions.length < 5 && used.size < pool.length) {
    const kind = kinds[(questions.length + 1) % kinds.length];
    const q = buildQuestion(kind, pool, rng, used);
    if (q) questions.push(q);
  }

  return {
    key,
    questions,
    bonusXp: 40,
    bonusCoins: 10,
  };
}

export const todaySpec = (): DailySpec => buildDailySpec(dateKey());