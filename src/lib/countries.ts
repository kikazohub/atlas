import raw from "@/data/countries.json";
import numericMap from "@/data/isoNumericToAlpha2.json";
import { FUN_FACTS } from "@/data/funfacts";
import type { ContinentId } from "./constants";

export interface Country {
  cca2: string;
  cca3: string;
  ccn3: string;
  nameES: string;
  nameEN: string;
  nativeName: string;
  nativeLang: string;
  capital: string;
  continent: ContinentId;
  subregion: string;
  population?: number;
  area?: number;
  currencies: { code: string; name: string; symbol: string }[];
  languages: string[];
  demonym: string;
  latlng: [number, number];
  flagEmoji: string;
  hasPolygon: boolean;
  funFact: string;
}

type RawCountry = Omit<Country, "funFact">;

export const COUNTRIES: Country[] = (raw as RawCountry[]).map((c) => ({
  ...c,
  funFact: FUN_FACTS[c.cca2] ?? "",
}));
export const ISO_NUMERIC_TO_ALPHA2 = numericMap as Record<string, string>;

const byCca2 = new Map<string, Country>();
for (const c of COUNTRIES) byCca2.set(c.cca2, c);

export const countryByCca2 = (cca2: string): Country | undefined =>
  byCca2.get(cca2);

export const countryByNumeric = (numericId: string): Country | undefined => {
  const cca2 = ISO_NUMERIC_TO_ALPHA2[numericId];
  return cca2 ? byCca2.get(cca2) : undefined;
};

export const countriesByContinent = (continent: ContinentId): Country[] =>
  COUNTRIES.filter((c) => c.continent === continent);

export const isCountryDiscovered = (discovered: Set<string>, cca2: string) =>
  discovered.has(cca2);