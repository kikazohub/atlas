export interface Badge {
  id: string;
  title: string;
  desc: string;
  emoji: string;
}

export const BADGES: Badge[] = [
  { id: "primer_paso", title: "Primer paso", desc: "Descubre tu primer país", emoji: "🛂" },
  { id: "mochila_10", title: "Mochilero", desc: "Descubre 10 países", emoji: "🎒" },
  { id: "explorador_25", title: "Explorador", desc: "Descubre 25 países", emoji: "🧭" },
  { id: "trotamundos_50", title: "Trotamundos", desc: "Descubre 50 países", emoji: "✈️" },
  { id: "conquistador_100", title: "Conquistador", desc: "Descubre 100 países", emoji: "🌟" },
  { id: "ciudadano_mundo", title: "Ciudadano del mundo", desc: "Descubre 150 países", emoji: "🌎" },
  { id: "continente_dominado", title: "Señor de un continente", desc: "Descubre todos los países de un continente", emoji: "👑" },
  { id: "racha_5", title: "En racha", desc: "5 aciertos seguidos en un juego", emoji: "🔥" },
  { id: "racha_10", title: "Imparable", desc: "10 aciertos seguidos en un juego", emoji: "🏆" },
  { id: "partida_perfecta", title: "Leyenda", desc: "Completa un juego perfecto", emoji: "💯" },
  { id: "primer_reto", title: "Rutinario", desc: "Completa tu primer reto diario", emoji: "📅" },
  { id: "reto_7", title: "Constante", desc: "Completa 7 retos diarios", emoji: "🗓️" },
  { id: "reto_30", title: "Incondicional", desc: "Completa 30 retos diarios", emoji: "🏅" },
  { id: "dias_3", title: "Calentando motores", desc: "Racha de 3 días seguidos", emoji: "⏳" },
  { id: "dias_7", title: "Semanero", desc: "Racha de 7 días seguidos", emoji: "📆" },
  { id: "sabio_capitales", title: "Sabio de capitales", desc: "50 aciertos en capitales", emoji: "🏙️" },
  { id: "vexilologo", title: "Experto en banderas", desc: "50 aciertos en banderas", emoji: "🚩" },
  { id: "cartografo", title: "Cartógrafo", desc: "25 países encontrados en el mapa", emoji: "🗺️" },
  { id: "fama_mundial", title: "Fama mundial", desc: "Alcanza 2000 XP", emoji: "⭐" },
  { id: "coleccionista", title: "Coleccionista", desc: "Todas las banderas y capitales", emoji: "📚" },
];

export const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]));

export interface Stats {
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

export function evaluateBadges(stats: Stats): Set<string> {
  const got = new Set<string>();
  const add = (id: string, ok: boolean) => {
    if (ok) got.add(id);
  };

  const seen = stats.seenCount;
  add("primer_paso", seen >= 1);
  add("mochila_10", seen >= 10);
  add("explorador_25", seen >= 25);
  add("trotamundos_50", seen >= 50);
  add("conquistador_100", seen >= 100);
  add("ciudadano_mundo", seen >= 150);

  add(
    "continente_dominado",
    Object.keys(stats.continentTotal).some(
      (k) => stats.seenByContinent[k] >= stats.continentTotal[k],
    ),
  );

  add("racha_5", stats.gameStreakMax >= 5);
  add("racha_10", stats.gameStreakMax >= 10);
  add("partida_perfecta", stats.perfectGames >= 1);
  add("primer_reto", stats.dailyDone >= 1);
  add("reto_7", stats.dailyDone >= 7);
  add("reto_30", stats.dailyDone >= 30);
  add("dias_3", stats.dailyStreak >= 3);
  add("dias_7", stats.dailyStreak >= 7);
  add("sabio_capitales", stats.capitalsCorrect >= 50);
  add("vexilologo", stats.flagsCorrect >= 50);
  add("cartografo", stats.findCorrect >= 25);
  add("fama_mundial", stats.xp >= 2000);
  add(
    "coleccionista",
    stats.capitalsCorrect >= 50 && stats.flagsCorrect >= 50,
  );

  return got;
}