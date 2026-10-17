// ──────────────────────────────────────────────────────────────
// SCRIPT:   scripts/generate-games-seed.mjs
// FUNCIÓN:  Genera assets/games-seed.json: el catálogo completo de videojuegos
//           empaquetado en la app para funcionar offline desde la instalación.
//           Como la BD en línea es MongoDB, el catálogo local también es un documento
//           JSON (misma estructura que usa services/gamesRepo.ts en el dispositivo).
// USO:      node scripts/generate-games-seed.mjs
// NOTA:     El mapeo de cada juego replica services/juegosApi.ts (fetchGameByQuery);
//           si ese mapeo cambia, actualizar aquí y regenerar el seed.
// ──────────────────────────────────────────────────────────────

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://games-api-iota.vercel.app';
const CATALOG_VERSION = 1;

// Elimina etiquetas HTML y espacios de más (idéntico a services/juegosApi.ts)
function stripHtml(value) {
  return (value || 'No hay descripción disponible.')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${url}`);
  }
  return response.json();
}

// Descarga el catálogo completo: lista de títulos + ficha de cada juego
async function buildCatalog() {
  const titles = await fetchJson(`${BASE_URL}/games`);
  const games = [];

  for (const title of titles) {
    try {
      const details = await fetchJson(`${BASE_URL}/games/${encodeURIComponent(title)}`);

      // Mapeo a la interfaz Game (portada + capturas, máximo 3)
      const images = [
        details.thumbnail,
        ...(details.screenshots || []).map((image) => image.image),
      ]
        .filter((image) => Boolean(image))
        .slice(0, 3);

      games.push({
        ...details,
        id: details.game_id,
        name: details.title,
        images,
        released: details.release_date || 'Sin fecha',
        developer: details.developer || 'Desarrollador no disponible',
        description: stripHtml(details.description || details.short_description),
      });

      console.log(`[Seed] OK: ${title}`);
    } catch (error) {
      console.warn(`[Seed] Se omite "${title}": ${error.message}`);
    }
  }

  if (games.length === 0) {
    throw new Error('No se pudo descargar ningún juego');
  }

  return {
    version: CATALOG_VERSION,
    // null = el catálogo viene pre-cargado, pero aún no se sincroniza en el dispositivo
    last_synced_at: null,
    games,
  };
}

async function main() {
  const catalog = await buildCatalog();

  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outDir = path.join(rootDir, 'assets');
  const outFile = path.join(outDir, 'games-seed.json');

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  console.log(`[Seed] ${catalog.games.length} juegos escritos en ${outFile}`);
}

main().catch((error) => {
  console.error('[Seed] Error:', error);
  process.exit(1);
});
