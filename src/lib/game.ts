import type { Country } from "./countries";

export type QuestionKind =
  | "flag-to-country"
  | "country-to-flag"
  | "country-to-capital"
  | "capital-to-country";

export interface Option {
  label: string;
  cca2: string;
}

export interface Question {
  kind: QuestionKind;
  promptCca2: string;
  options: Option[];
  correctIndex: number;
}

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickDistractors(
  pool: Country[],
  subject: Country,
  n: number,
  rng: Rng,
): Country[] {
  const used = new Set<string>([subject.cca2]);
  const out: Country[] = [];
  let guard = 0;
  while (out.length < n && guard < 500) {
    guard++;
    const cand = pick(pool, rng);
    if (used.has(cand.cca2)) continue;
    used.add(cand.cca2);
    out.push(cand);
  }
  return out;
}

export function buildQuestionMany(
  kind: QuestionKind,
  pool: Country[],
  count: number,
  rng: Rng,
): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 8) {
    guard++;
    const q = buildQuestion(kind, pool, rng, seen);
    if (!q) continue;
    out.push(q);
  }
  return out;
}

export function buildMixedQuestions(
  kinds: QuestionKind[],
  pool: Country[],
  count: number,
  rng: Rng,
): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 12) {
    guard++;
    const kind = kinds[Math.floor(rng() * kinds.length)] as QuestionKind;
    const q = buildQuestion(kind, pool, rng, seen);
    if (!q) continue;
    out.push(q);
  }
  return out;
}

export function buildQuestion(
  kind: QuestionKind,
  pool: Country[],
  rng: Rng,
  avoid?: Set<string>,
): Question | null {
  const subject = pool[Math.floor(rng() * pool.length)];
  if (avoid?.has(subject.cca2)) return null;
  const distractors = pickDistractors(pool, subject, 3, rng);
  if (distractors.length < 3) return null;
  if (avoid) avoid.add(subject.cca2);

  let options: Option[];
  if (kind === "flag-to-country") {
    options = distractors.map((d) => ({ label: d.nameES, cca2: d.cca2 }));
    options.unshift({ label: subject.nameES, cca2: subject.cca2 });
  } else if (kind === "country-to-flag") {
    options = distractors.map((d) => ({ label: d.nameES, cca2: d.cca2 }));
    options.unshift({ label: subject.nameES, cca2: subject.cca2 });
  } else if (kind === "country-to-capital") {
    const capOpts = new Map<string, string>();
    for (const d of [subject, ...distractors]) {
      const label = d.capital;
      if (!capOpts.has(label)) capOpts.set(label, d.cca2);
    }
    if (capOpts.size < 4) return null;
    options = [...capOpts.entries()].map(([label, cca2]) => ({
      label,
      cca2,
    }));
  } else {
    // capital-to-country
    options = distractors.map((d) => ({ label: d.nameES, cca2: d.cca2 }));
    options.unshift({ label: subject.nameES, cca2: subject.cca2 });
  }

  options = shuffle(options, rng);
  return {
    kind,
    promptCca2: subject.cca2,
    options,
    correctIndex: options.findIndex((o) => o.cca2 === subject.cca2),
  };
}

export const XPCorrect = 8;
export const XPPerfectBonus = 20;
export const CoinsCorrect = 1;
export const CoinsPerfectBonus = 5;
export const CoinsNewCountry = 5;

export const dailyStreakXpBonus = (days: number): number => {
  if (days < 2) return 0;
  if (days === 2) return 5;
  if (days === 3) return 10;
  if (days >= 4 && days < 7) return 15;
  return 20;
};

export interface GameResult {
  kind: "flags" | "capitals" | "find" | "daily";
  correct: number;
  total: number;
  perfect: boolean;
  maxStreak: number;
}