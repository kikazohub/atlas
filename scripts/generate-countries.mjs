import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const world = require("world-countries");
const populationList = require("country-json/src/country-by-population.json");
const worldAtlas = require("world-atlas/countries-110m.json");
const topojson = require("topojson-client");

/* ------------------------------------------------------------------ */
/* Helpers + tablas curadas                                             */
/* ------------------------------------------------------------------ */

const CONTINENT_OF = (region, subregion) => {
  if (region === "Africa") return "africa";
  if (region === "Asia") return "asia";
  if (region === "Europe") return "europe";
  if (region === "Oceania") return "oceania";
  if (region === "Antarctic") return "antarctic";
  // región "Americas"
  if (subregion === "South America") return "south-america";
  return "north-america";
};

const SUBREGION_ES = {
  "Western Africa": "África Occidental",
  "Eastern Africa": "África Oriental",
  "Middle Africa": "África Central",
  "Northern Africa": "África del Norte",
  "Southern Africa": "África Austral",
  "Southern Europe": "Europa Meridional",
  "Western Europe": "Europa Occidental",
  "Northern Europe": "Europa Septentrional",
  "Eastern Europe": "Europa Oriental",
  "Southeast Asia": "Sudeste Asiático",
  "Southern Asia": "Asia Meridional",
  "Central Asia": "Asia Central",
  "Western Asia": "Asia Occidental",
  "Eastern Asia": "Asia Oriental",
  "South-Eastern Asia": "Sudeste Asiático",
  "Melanesia": "Melanesia",
  "Micronesia": "Micronesia",
  "Polynesia": "Polinesia",
  "Australia and New Zealand": "Australia y Nueva Zelanda",
  "Caribbean": "Caribe",
  "Central America": "Centroamérica",
  "Northern America": "América del Norte",
  "South America": "Sudamérica",
};

const LANG_ES = {
  spa: "Español", eng: "Inglés", fra: "Francés", deu: "Alemán",
  ita: "Italiano", por: "Portugués", rus: "Ruso", ara: "Árabe",
  hin: "Hindi", zho: "Chino", chi: "Chino", jpn: "Japonés", kor: "Coreano",
  tur: "Turco", nld: "Neerlandés", pol: "Polaco", ukr: "Ucraniano",
  swe: "Sueco", nor: "Noruego", dan: "Danés", fin: "Finés",
  ces: "Checo", slk: "Eslovaco", hun: "Húngaro", ron: "Rumano",
  bul: "Búlgaro", ell: "Griego", heb: "Hebreo", tha: "Tailandés",
  vie: "Vietnamita", ind: "Indonesio", zsm: "Malayo", msa: "Malayo",
  fil: "Filipino", swa: "Suajili", zul: "Zulú", xho: "Xhosa",
  afr: "Afrikáans", ben: "Bengalí", urd: "Urdu", tam: "Tamil",
  tel: "Telugú", mar: "Maratí", ori: "Oriya", pan: "Panyabí",
  guj: "Guyaratí", kan: "Canarés", mal: "Malayalam", nep: "Nepalí", lat: "Latín",
  grc: "Griego antiguo",
  sin: "Cingalés", khm: "Jemer", lao: "Lao", mya: "Birmano",
  kaz: "Kazajo", uzb: "Uzbeko", aze: "Azerí", kat: "Georgiano",
  hye: "Armenio", bel: "Bielorruso", isl: "Islandés", aln: "Albanés",
  sqi: "Albanés", mkd: "Macedonio", srp: "Serbio", hrv: "Croata",
  slv: "Esloveno", bos: "Bosnio", lit: "Lituano", lav: "Letón",
  est: "Estonio", mt: "Maltés", gle: "Irlandés", cym: "Galés",
  gla: "Gaélico escocés", eus: "Euskera", cat: "Catalán",
  glg: "Gallego", oci: "Occitano", lad: "Ladino", amh: "Amárico",
  som: "Somalí", rw: "Kiñaruanda", sw: "Suajili", tn: "Setsuana",
  sn: "Chona", ln: "Lingala", kg: "Kikongo", ff: "Fulani",
  ha: "Hausa", ig: "Igbo", yo: "Yoruba", ny: "Chichewa",
  mfe: "Criollo mauriciano", ts: "Tsonga", st: "Sesoto",
  nso: "Sepedi", ve: "Venda", to: "Tongano", fj: "Fiyiano",
  sm: "Samoano", ty: "Tahitiano", cal: "Carolino", pau: "Palauano",
  gil: "Gilbertés", na: "Nauruano", mi: "Maorí", dv: "Maldivo",
  ps: "Pastún", fa: "Persa", ur: "Urdu", bn: "Bengalí",
  hi: "Hindi", ta: "Tamil", kn: "Canarés", ml: "Malayalam",
  pa: "Panyabí", gu: "Guyaratí", mr: "Maratí", te: "Telugú",
  or: "Odia", as: "Asamés", sd: "Sindí", si: "Cingalés",
  ne: "Nepalí", dz: "Dzongkha", km: "Jemer", lo: "Lao",
  my: "Birmano", th: "Tailandés", vi: "Vietnamita", id: "Indonesio",
  ms: "Malayo", tl: "Tagalo", mg: "Malgache", wo: "Wólof",
  yo: "Yoruba", ig: "Igbo", ha: "Hausa", am: "Amárico",
  ti: "Tigriña", so: "Somalí", om: "Oromo", lg: "Luganda",
  sn: "Chona", ny: "Chichewa", ts: "Tsonga", ss: "Suazi",
  nr: "Ndebele del norte", st: "Sesoto", tn: "Setsuana",
  ve: "Venda", xh: "Xhosa", zu: "Zulú", en: "Inglés", fr: "Francés",
  pt: "Portugués", es: "Español", de: "Alemán", it: "Italiano",
  nl: "Neerlandés", ru: "Ruso", ar: "Árabe", zh: "Chino",
  ja: "Japonés", ko: "Coreano", tr: "Turco", he: "Hebreo",
  el: "Griego", pl: "Polaco", uk: "Ucraniano", cs: "Checo",
  sk: "Eslovaco", hu: "Húngaro", ro: "Rumano", bg: "Búlgaro",
  sr: "Serbio", hr: "Croata", sl: "Esloveno", bs: "Bosnio",
  mk: "Macedonio", sq: "Albanés", lt: "Lituano", lv: "Letón",
  et: "Estonio", is: "Islandés", sv: "Sueco", da: "Danés",
  no: "Noruego", fi: "Finés", ga: "Irlandés", cy: "Galés",
  gd: "Gaélico escocés", ca: "Catalán", eu: "Euskera", gl: "Gallego",
};

const CURRENCY_ES = {
  EUR: "Euro", USD: "Dólar estadounidense", GBP: "Libra esterlina",
  CHF: "Franco suizo", JPY: "Yen japonés", CNY: "Yuan chino",
  KRW: "Won surcoreano", INR: "Rupia india", RUB: "Rublo ruso",
  BRL: "Real brasileño", ARS: "Peso argentino", MXN: "Peso mexicano",
  COP: "Peso colombiano", CLP: "Peso chileno", PEN: "Sol peruano",
  VES: "Bolívar", UYU: "Peso uruguayo", PYG: "Guaraní",
  BOB: "Boliviano", CAD: "Dólar canadiense", AUD: "Dólar australiano",
  NZD: "Dólar neozelandés", ZAR: "Rand sudafricano", KES: "Chelín keniano",
  EGP: "Libra egipcia", MAD: "Dírham marroquí", NGN: "Naira nigeriana",
  GHS: "Cedi ghanés", ETB: "Birr etíope", TZS: "Chelín tanzano",
  UGX: "Chelín ugandés", XOF: "Franco CFA de África Occidental",
  XAF: "Franco CFA de África Central", CNY: "Yuan", AED: "Dírham de los EAU",
  SAR: "Riyal saudí", QAR: "Riyal qatarí", KWD: "Dinar kuwaití",
  ILS: "Nuevo séquel", TRY: "Lira turca", GEL: "Lari georgiano",
  AMD: "Dram armenio", AZN: "Manat azerbaiyano", KZT: "Tenge kazajo",
  THB: "Baht tailandés", VND: "Dong vietnamita", IDR: "Rupia indonesia",
  MYR: "Ringgit malayo", PHP: "Peso filipino", SGD: "Dólar de Singapur",
  HKD: "Dólar de Hong Kong", TWD: "Dólar taiwanés", PKR: "Rupia pakistaní",
  BDT: "Taka bangladesí", LKR: "Rupia ceilandesa", NPR: "Rupia nepalí",
  AFN: "Afgani", IRR: "Rial iraní", IQD: "Dinar iraquí",
  LBP: "Libra libanesa", SYP: "Libra siria", JOD: "Dinar jordano",
  OMR: "Rial omaní", YER: "Rial yemení", SEK: "Corona sueca",
  NOK: "Corona noruega", DKK: "Corona danesa", PLN: "Zloty polaco",
  CZK: "Corona checa", HUF: "Florín húngaro", RON: "Leu rumano",
  BGN: "Lev búlgaro", UAH: "Grivna ucraniana", ISK: "Corona islandesa",
  HRK: "Kuna", RSD: "Dinar serbio", ALL: "Lek albanés",
  MKD: "Denar macedonio", BAM: "Marco convertible", BYN: "Rublo bielorruso",
  MDL: "Leu moldavo", CUP: "Peso cubano", DOP: "Peso dominicano",
  HTG: "Gourde haitiano", JMD: "Dólar jamaiquino", TTD: "Dólar de Trinidad y Tobago",
  GTQ: "Quetzal", HNL: "Lempira", NIO: "Córdoba", CRC: "Colón costarricense",
  PAB: "Balboa", GTQ: "Quetzal", BZD: "Dólar beliceño",
  BHD: "Dinar bahreiní", PKR: "Rupia pakistaní", KHR: "Riel camboyano",
  LAK: "Kip lao", MNT: "Tugrik mongol", KGS: "Som kirguís",
  TJS: "Somoni tayiko", TMT: "Manat turcomano", FJD: "Dólar fiyiano",
  PGK: "Kina de Papúa Nueva Guinea", TOP: "Pa'anga", WST: "Tala",
  VUV: "Vatu", SBD: "Dólar de las Islas Salomón",
  XCD: "Dólar del Caribe Oriental", NAD: "Dólar namibio", BWP: "Pula",
  MZN: "Metical", MWK: "Kwacha malauí", ZMW: "Kwacha zambiano",
  AOA: "Kwanza", GNF: "Franco guineano", SRD: "Dólar surinamés",
  GYD: "Dólar guyanés", BSD: "Dólar bahameño", BBD: "Dólar de Barbados",
  CUC: "Peso convertible", EGP: "Libra egipcia", LYD: "Dinar libio",
  TND: "Dinar tunecino", DZD: "Dinar argelino", MRO: "Uguia",
  MRU: "Uguia", SSP: "Libra sursudanesa", SDG: "Libra sudanesa",
  DJF: "Franco yibutí", ERN: "Nakfa", SOS: "Chelín somalí",
  MUR: "Rupia mauriciana", SCR: "Rupia de Seychelles",
  CVE: "Escudo caboverdiano", STN: "Dobra", AMD: "Dram", GMD: "Dalasi",
  SLL: "Leone", LRD: "Dólar liberiano", SBD: "Dólar salomonense",
  BIF: "Franco burundés", ETB: "Birr", KMF: "Franco comorense",
  MGA: "Ariary malgache", MVR: "Rufiyaa", BND: "Dólar de Brunéi",
};

const CAPITAL_ES = {
  US: "Washington D. C.", MX: "Ciudad de México", EG: "El Cairo",
  IN: "Nueva Delhi", TH: "Bangkok", VN: "Hanói", TW: "Taipéi",
  KR: "Seúl", CN: "Pekín", KP: "Pionyang", SA: "Riad", JO: "Amán",
  LY: "Trípoli", DZ: "Argel", TR: "Ankara", KZ: "Astaná",
  UZ: "Taskent", AZ: "Bakú", GE: "Tiflis", AM: "Ereván", BY: "Minsk",
  UA: "Kiev", GB: "Londres", CH: "Berna", SE: "Estocolmo",
  DK: "Copenhague", NL: "Ámsterdam", BE: "Bruselas", PL: "Varsovia",
  CZ: "Praga", RO: "Bucarest", GR: "Atenas", SI: "Liubliana",
  AL: "Tirana", LT: "Vilna", MD: "Chisináu", IS: "Reikiavik",
  MT: "La Valeta", RU: "Moscú", ID: "Yakarta", MY: "Kuala Lumpur",
  CL: "Santiago", BO: "La Paz", CU: "La Habana", HT: "Puerto Príncipe",
  JM: "Kingston", TT: "Puerto España", PA: "Ciudad de Panamá",
  GT: "Ciudad de Guatemala", NI: "Managua", BZ: "Belmopán",
  NP: "Katmandú", BD: "Daca", IR: "Teherán", IQ: "Bagdad",
  IL: "Jerusalén", LB: "Beirut", SY: "Damasco", KW: "Ciudad de Kuwait",
  QA: "Doha", AE: "Abu Dabi", OM: "Mascate", YE: "Saná",
  MM: "Naipyidó", LA: "Vientiane", KH: "Nom Pen", BT: "Timbu",
  MYA: "Naipyidó", AU: "Canberra", NZ: "Wellington",
  PE: "Lima", CO: "Bogotá", VE: "Caracas", EC: "Quito",
  PY: "Asunción", DO: "Santo Domingo", CR: "San José",
  SV: "San Salvador", HN: "Tegucigalpa", LK: "Colombo", CI: "Yamusukro",
  VA: "Ciudad del Vaticano", SG: "Singapur", FR: "París", TO: "Nukualofa",
  PT: "Lisboa",
};

const DEMONYM_ES = {
  ES: "español/a", AR: "argentino/a", MX: "mexicano/a", CO: "colombiano/a",
  PE: "peruano/a", CL: "chileno/a", VE: "venezolano/a", EC: "ecuatoriano/a",
  BO: "boliviano/a", PY: "paraguayo/a", UY: "uruguayo/a", GT: "guatemalteco/a",
  HN: "hondureño/a", NI: "nicaragüense", SV: "salvadoreño/a", CR: "costarricense",
  PA: "panameño/a", CU: "cubano/a", DO: "dominicano/a", PR: "puertorriqueño/a",
  HT: "haitiano/a", JM: "jamaiquino/a", TT: "trinitense", BZ: "beliceño/a",
  US: "estadounidense", CA: "canadiense", BR: "brasileño/a", GB: "británico/a",
  FR: "francés/a", DE: "alemán/a", IT: "italiano/a", PT: "portugués/a",
  NL: "neerlandés/a", BE: "belga", CH: "suizo/a", AT: "austriaco/a",
  IE: "irlandés/a", DK: "danés/a", SE: "sueco/a", NO: "noruego/a",
  FI: "finlandés/a", IS: "islandés/a", PL: "polaco/a", CZ: "checo/a",
  SK: "eslovaco/a", HU: "húngaro/a", RO: "rumano/a", BG: "búlgaro/a",
  GR: "griego/a", HR: "croata", RS: "serbio/a", SI: "esloveno/a",
  BA: "bosnio/a", MK: "macedonio/a", AL: "albanés/a", ME: "montenegrino/a",
  RU: "ruso/a", UA: "ucraniano/a", BY: "bielorruso/a", LT: "lituano/a",
  LV: "letón/ona", EE: "estonio/a", MD: "moldavo/a",
  TR: "turco/a", AZ: "azerbaiyano/a", GE: "georgiano/a", AM: "armenio/a",
  KZ: "kazajo/a", UZ: "uzbeko/a", KG: "kirguís", TM: "turcomano/a",
  TJ: "tayiko/a", MN: "mongol/a", CN: "chino/a", JP: "japonés/a",
  KR: "surcoreano/a", KP: "norcoreano/a", TW: "taiwanés/a", HK: "hongkonés/a",
  IN: "indio/a", PK: "pakistaní", BD: "bangladesí", NP: "nepalí",
  BT: "butanés/a", LK: "ceilandés/a", MV: "maldivo/a", AF: "afgano/a",
  IR: "iraní", IQ: "iraquí", SA: "saudí", YE: "yemení", SY: "sirio/a",
  LB: "libanés/a", JO: "jordano/a", IL: "israelí", KW: "kuwaití",
  QA: "catarí", AE: "emiratí", OM: "omaní", BH: "bahreiní",
  TH: "tailandés/a", VN: "vietnamita", ID: "indonesio/a", MY: "malasio/a",
  SG: "singapurense", PH: "filipino/a", MM: "birmano/a", KH: "camboyano/a",
  LA: "laosiano/a", AU: "australiano/a", NZ: "neozelandés/a",
  FJ: "fiyiano/a", PG: "papú", WS: "samoano/a", TO: "tongano/a",
  MH: "marshalés/a", FM: "micronesio/a", PW: "palauano/a", NR: "nauruano/a",
  TV: "tuvaluano/a", KI: "kiribatiano/a", ZA: "sudafricano/a",
  NG: "nigeriano/a", KE: "keniano/a", GH: "ghanés/a", ET: "etíope",
  TZ: "tanzano/a", UG: "ugandés/a", MA: "marroquí", DZ: "argelino/a",
  TN: "tunecino/a", LY: "libio/a", EG: "egipcio/a", SN: "senegalés/a",
  CM: "camerunés/a", CI: "marfileño/a", AO: "angoleño/a", MZ: "mozambiqueño/a",
  ZM: "zambiano/a", ZW: "zimbabuense", MW: "malauí", BW: "botsuano/a",
  NA: "namibio/a", MG: "malgache", MU: "mauriciano/a", SC: "seychellense",
  CV: "caboverdiano/a", ST: "santomense", GQ: "ecuatoguineano/a",
  GN: "guineano/a", GW: "guineano/a", SL: "sierraleonés/a", LR: "liberiano/a",
  MR: "mauritano/a", NE: "nigerino/a", TD: "chadiano/a", CF: "centroafricano/a",
  GA: "gabonés/a", CG: "congoleño/a", CD: "congoleño/a", BI: "burundés/a",
  RW: "ruandés/a", DJ: "yibutiano/a", SO: "somalí", ER: "eritreo/a",
  SS: "sursudanés/a", SD: "sudanés/a", GM: "gambiano/a", BJ: "beninés/a",
  BF: "burkinés", TG: "togolés/a", ML: "maliense", GI: "gibraltareño/a",
  MC: "monegasco/a", AD: "andorrano/a", SM: "sanmarinense", LI: "liechtensteiniano/a",
  MT: "maltés/a", MK: "macedonio/a", VA: "vaticano/a", XK: "kosovar",
};

const POPULATION_ALIAS = {
  US: "United States", GB: "United Kingdom", CD: "Congo (Kinshasa)  ",
  CG: "Congo (Brazzaville)", KR: "South Korea", KP: "North Korea",
  LA: "Laos", IR: "Iran", VN: "Vietnam", SY: "Syria", BO: "Bolivia",
  CZ: "Czech Republic", MD: "Moldova", MZ: "Mozambique", TZ: "Tanzania",
  VE: "Venezuela", CI: "Ivory Coast", XK: "Kosovo", PS: "Palestine",
  MM: "Burma", FM: "Micronesia", TL: "East Timor", SZ: "Swaziland",
};

/* ------------------------------------------------------------------ */
/* Cálculo                                                              */
/* ------------------------------------------------------------------ */

const popByName = new Map(populationList.map((p) => [p.country.trim().toLowerCase(), p.population]));

const featIds = new Set(
  topojson
    .feature(worldAtlas, worldAtlas.objects.countries)
    .features.map((f) => String(f.id)),
);

const countries = [];
for (const c of world) {
  if (!(c.independent === true || c.unMember === true)) continue;

  const cca2 = c.cca2;
  const region = c.region ?? "";
  const subregionES = SUBREGION_ES[c.subregion] ?? c.subregion ?? "";
  const continent = CONTINENT_OF(region, c.subregion);
  if (continent === "antarctic") continue;

  const nameES =
    c.translations?.spa?.common?.trim() || c.name.common || c.translations?.spa?.official || c.name.official;
  const capital = CAPITAL_ES[cca2] ?? c.capital?.[0] ?? "—";
  const demonym = DEMONYM_ES[cca2] ?? c.demonyms?.eng?.m ?? "—";
  const currencies = Object.entries(c.currencies ?? {})
    .map(([code, v]) => ({
      code,
      name: CURRENCY_ES[code] ?? v.name ?? code,
      symbol: v.symbol ?? "",
    }))
    .filter((c2) => !["ZZZ"].includes(c2.code));
  const langs = Object.keys(c.languages ?? {})
    .map((code) => LANG_ES[code] ?? c.languages[code])
    .filter((v, i, a) => a.indexOf(v) === i);
  const popKey = (POPULATION_ALIAS[cca2] ?? c.name.common).trim().toLowerCase();
  const population = popByName.get(popKey);

  countries.push({
    cca2,
    cca3: c.cca3 ?? "",
    ccn3: String(c.ccn3 ?? ""),
    nameES,
    nameEN: c.name.common ?? "",
    capital,
    continent,
    subregion: subregionES,
    population: Number.isFinite(population) ? population : undefined,
    area: Number.isFinite(c.area) ? c.area : undefined,
    currencies,
    languages: langs,
    demonym,
    latlng: Array.isArray(c.latlng) ? c.latlng : [0, 0],
    flagEmoji: c.flag ?? "",
    hasPolygon: featIds.has(String(c.ccn3)),
  });
}

countries.sort((a, b) => a.nameES.localeCompare(b.nameES, "es"));

/* índice numérico → alpha2 SOLO para países con polígono */
const isoNumericToAlpha2 = {};
for (const c of countries) {
  if (c.hasPolygon && c.ccn3) isoNumericToAlpha2[c.ccn3] = c.cca2;
}

mkdirSync(resolve(ROOT, "src/data"), { recursive: true });
writeFileSync(
  resolve(ROOT, "src/data/countries.json"),
  JSON.stringify(countries, null, 2) + "\n",
);
writeFileSync(
  resolve(ROOT, "src/data/isoNumericToAlpha2.json"),
  JSON.stringify(isoNumericToAlpha2, null, 2) + "\n",
);

const withPop = countries.filter((c) => c.population !== undefined).length;
const nPolygons = countries.filter((c) => c.hasPolygon).length;
const nMarkers = countries.filter((c) => !c.hasPolygon).length;
console.log(
  `countries.json → ${countries.length} países (polígonos: ${nPolygons}, marcadores: ${nMarkers}, con población: ${withPop})`,
);