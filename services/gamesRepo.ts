// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/gamesRepo.ts
// FUNCIÓN:  Repositorio local del catálogo de videojuegos. Como la BD en línea es
//           MongoDB (documentos), el almacenamiento local es un archivo JSON en el
//           dispositivo (expo-file-system) con el catálogo completo, no una tabla SQL.
// DEPENDE:  expo-file-system, services/db.ts (soporte nativo), assets/games-seed.json
// USADO POR: services/syncEngine.ts, context/GameSearchContext.tsx
// CAMBIOS:  estructura del documento → GamesCatalog | archivo → CATALOG_FILE_NAME |
//           respaldo web → findGameInSeed (seed empaquetado, sin disco)
// NOTA:     En web no hay catálogo en archivo; la búsqueda usa el seed empaquetado
//           como respaldo (ver context/GameSearchContext.tsx)
// ──────────────────────────────────────────────────────────────

import { File, Paths } from 'expo-file-system';
import { isDatabaseSupported } from '@/services/db';
import gamesSeed from '@/assets/games-seed.json';
import { Game } from '@/types';

// ¿La plataforma soporta el catálogo local en archivo? (solo nativo Android/iOS)
export const isGamesStoreSupported = isDatabaseSupported;

// Documento raíz del catálogo (metadatos + documentos de juegos, estilo Mongo)
export interface GamesCatalog {
  version: number;
  last_synced_at: number | null;
  games: Game[];
}

const CATALOG_VERSION = 1;
const CATALOG_FILE_NAME = 'catalogo-juegos.json';

// Referencia al archivo del catálogo en el almacenamiento propio de la app
function catalogFile(): File {
  return new File(Paths.document, CATALOG_FILE_NAME);
}

// Catálogo vacío: estado inicial cuando todavía no hay archivo ni sincronización
function emptyCatalog(): GamesCatalog {
  return { version: CATALOG_VERSION, last_synced_at: null, games: [] };
}

// ─── [SECCIÓN] Lecturas (desde el archivo JSON) ───

// Lee el catálogo completo; si no existe o está corrupto devuelve uno vacío
export async function readGamesCatalog(): Promise<GamesCatalog> {
  const file = catalogFile();

  if (!file.exists) {
    return emptyCatalog();
  }

  try {
    const parsed = JSON.parse(await file.text()) as GamesCatalog;

    if (!parsed || !Array.isArray(parsed.games)) {
      return emptyCatalog();
    }

    return {
      version: parsed.version ?? CATALOG_VERSION,
      last_synced_at: parsed.last_synced_at ?? null,
      games: parsed.games,
    };
  } catch (error) {
    console.error('[GamesRepo] Corrupt catalog file, starting empty:', error);
    return emptyCatalog();
  }
}

// Compara una lista de juegos contra la búsqueda: por ID (si es numérica), por título
// exacto y, como último recurso, por coincidencia parcial (el título más corto gana)
function matchGame(games: Game[], query: string): Game | null {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return null;
  }

  const numericId = Number(clean);
  if (Number.isInteger(numericId) && numericId > 0) {
    const byId = games.find((game) => game.id === numericId);
    if (byId) {
      return byId;
    }
  }

  const exact = games.find((game) => game.name.toLowerCase() === clean);
  if (exact) {
    return exact;
  }

  // Coincidencia parcial (el título más corto gana: "war" → "Warframe")
  const partial = games
    .filter((game) => game.name.toLowerCase().includes(clean))
    .sort((a, b) => a.name.length - b.name.length);

  return partial[0] ?? null;
}

// Busca localmente en el archivo JSON del dispositivo (solo nativo)
export async function findGameLocal(query: string): Promise<Game | null> {
  if (!query.trim()) {
    return null;
  }

  const { games } = await readGamesCatalog();
  return matchGame(games, query);
}

// Busca en el catálogo empaquetado (assets/games-seed.json) sin tocar el disco:
// respaldo de la web, donde no existe catálogo en archivo
export function findGameInSeed(query: string): Game | null {
  if (!query.trim()) {
    return null;
  }

  const seed = gamesSeed as GamesCatalog;
  return matchGame(seed.games, query);
}

// ─── [SECCIÓN] Escrituras locales ───

// Escribe el catálogo completo en el archivo (crea el archivo si no existe)
export async function writeGamesCatalog(games: Game[], syncedAt: number | null): Promise<void> {
  const file = catalogFile();

  const catalog: GamesCatalog = {
    version: CATALOG_VERSION,
    last_synced_at: syncedAt,
    games,
  };

  // La primera vez el archivo no existe: se crea antes de escribir
  if (!file.exists) {
    file.create();
  }

  file.write(JSON.stringify(catalog));
}

// Guarda o actualiza un único juego en el catálogo (cachea resultados de búsqueda)
export async function upsertGameLocal(game: Game): Promise<void> {
  const catalog = await readGamesCatalog();
  const index = catalog.games.findIndex((item) => item.id === game.id);
  const games = [...catalog.games];

  if (index >= 0) {
    games[index] = game;
  } else {
    games.push(game);
  }

  await writeGamesCatalog(games, catalog.last_synced_at);
}

// Reescribe el catálogo con la versión de la nube y sella la fecha de sincronización
export async function replaceGamesCatalog(games: Game[]): Promise<GamesCatalog> {
  const syncedAt = Date.now();
  await writeGamesCatalog(games, syncedAt);
  return { version: CATALOG_VERSION, last_synced_at: syncedAt, games };
}

// Siembra el catálogo desde el JSON empaquetado en la app (primer arranque sin red).
// Si el archivo ya existe (aunque tenga datos de una sync previa) no lo toca.
export async function seedGamesCatalogFromBundle(): Promise<void> {
  const file = catalogFile();
  if (file.exists) {
    return;
  }

  const seed = gamesSeed as GamesCatalog;
  console.log('[GamesRepo] Seeding catalog from bundle:', seed.games.length);
  await writeGamesCatalog(seed.games, seed.last_synced_at);
}
