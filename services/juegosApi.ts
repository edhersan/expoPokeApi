import { FREETOGAME_API_URL } from '@/constants/freetogame';
import { Game } from '@/types';

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

async function fetchGame(identifier: string): Promise<GameApiResponse> {
  const response = await fetch(`${FREETOGAME_API_URL}/games/${encodeURIComponent(identifier)}`);

  if (!response.ok) {
    throw new Error('GAME_NOT_FOUND');
  }

  return response.json();
}

function stripHtml(value: string): string {
  return (value || 'No hay descripción disponible.')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchGameByQuery(query: string): Promise<Game> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error('EMPTY_QUERY');
  }

  const details = await fetchGame(cleanQuery);

  const images = [
    details.thumbnail,
    ...(details.screenshots || []).map((image) => image.image),
  ].filter((img): img is string => Boolean(img)).slice(0, 3);

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