// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/juegosApi.ts
// FUNCIÓN:  Conexión con la API de videojuegos (FreeToGame)
// DEPENDE:  constants/freetogame.ts (FREETOGAME_API_URL), types/index.ts (Game)
// USADO POR: context/GameSearchContext.tsx → pantallas "Juegos" e "Info Juego"
// CAMBIOS:  URL base → constants/freetogame.ts | nº de imágenes en la galería → .slice(0, 3)
// ──────────────────────────────────────────────────────────────

import { FREETOGAME_API_URL } from '@/constants/freetogame';
import { Game } from '@/types';

// Respuesta cruda de la API de juegos (formato original de FreeToGame)
interface GameApiResponse {
  game_id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  developer: string;
  release_date: string;
  description: string;
  screenshots: Array<{ id: number; image: string }>;
}

// Descarga un juego por su identificador (nombre o id) desde la API
// Lanza 'GAME_NOT_FOUND' si la API responde con error
async function fetchGame(identifier: string): Promise<GameApiResponse> {
  const url = `${FREETOGAME_API_URL}/games/${encodeURIComponent(identifier)}`;
  console.log('[GamesAPI] Fetching:', url);

  try {
    const response = await fetch(url);
    console.log('[GamesAPI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GamesAPI] Error response:', errorText);
      throw new Error('GAME_NOT_FOUND');
    }

    return response.json();
  } catch (error) {
    console.error('[GamesAPI] Fetch failed:', error);
    throw error;
  }
}

// Elimina etiquetas HTML y espacios de más de un texto (la descripción viene con <p>, <br>, etc.)
function stripHtml(value: string): string {
  return (value || 'No hay descripción disponible.')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Busca un videojuego por nombre y devuelve su ficha ya normalizada al tipo `Game`.
// Lanza: 'EMPTY_QUERY' si la búsqueda está vacía | 'GAME_NOT_FOUND' si no existe
export async function fetchGameByQuery(query: string): Promise<Game> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error('EMPTY_QUERY');
  }

  console.log('[GamesAPI] Searching for:', cleanQuery);
  const details = await fetchGame(cleanQuery);

  // ─── [SECCIÓN] Mapeo a la interfaz Game ───
  // Imágenes de la galería: portada (thumbnail) + capturas, máximo 3
  const images = [
    details.thumbnail,
    ...(details.screenshots || []).map((image) => image.image),
  ].filter((img): img is string => Boolean(img)).slice(0, 3);

  console.log('[GamesAPI] Success:', details.title);
  return {
    ...details,
    id: details.game_id,
    name: details.title,
    images,
    released: details.release_date || 'Sin fecha',
    developer: details.developer || 'Desarrollador no disponible',
    description: stripHtml(details.description || details.short_description),
  };
}
