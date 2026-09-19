export type ContinentId =
  | "africa"
  | "asia"
  | "europe"
  | "oceania"
  | "north-america"
  | "south-america";

export interface ContinentMeta {
  label: string;
  emoji: string;
  hex: string;
}

export const CONTINENT_META: Record<ContinentId, ContinentMeta> = {
  africa: { label: "África", emoji: "🌍", hex: "#f59e0b" },
  asia: { label: "Asia", emoji: "🌏", hex: "#ef4444" },
  europe: { label: "Europa", emoji: "🇪🇺", hex: "#3b82f6" },
  oceania: { label: "Oceanía", emoji: "🏝️", hex: "#22d3ee" },
  "north-america": { label: "Norteamérica", emoji: "🦃", hex: "#f97316" },
  "south-america": { label: "Sudamérica", emoji: "🦜", hex: "#10b981" },
};

export const CONTINENT_ORDER: ContinentId[] = [
  "africa",
  "asia",
  "europe",
  "oceania",
  "north-america",
  "south-america",
];

export const FLAG_BASE = "/flags/";
export const flagUrl = (cca2: string) => `${FLAG_BASE}${cca2.toLowerCase()}.svg`;

export const formatCompact = (n: number): string => {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) {
    const v = n / 1e9;
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(2)} mil millones`;
  }
  if (n >= 1e6) {
    const v = n / 1e6;
    return `${v >= 100 ? v.toFixed(0) : v.toFixed(1)} millones`;
  }
  if (n >= 1e3) {
    return `${Math.round(n).toLocaleString("es")}`;
  }
  return String(Math.round(n));
};