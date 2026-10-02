import { FREETOGAME_API_URL } from '@/constants/freetogame';
import { Game } from '@/types';

interface FreeToGameItem {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

interface FreeToGameDetail extends FreeToGameItem {
  description: string;
  screenshots: Array<{ id: number; image: string }>;
  minimum_system_requirements: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
}

async function fetchFreeToGame(path: string, params: Record<string, string> = {}): Promise<FreeToGameItem[] | FreeToGameDetail> {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await fetch(`${FREETOGAME_API_URL}${path}${query}`);

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

  const games = await fetchFreeToGame('/games') as FreeToGameItem[];
  const game = games.find((item) => 
    item.title.toLowerCase().includes(cleanQuery.toLowerCase())
  );
  
  if (!game) {
    throw new Error('GAME_NOT_FOUND');
  }

  const details = await fetchFreeToGame('/game', { id: String(game.id) }) as FreeToGameDetail;

  const images = [
    details.thumbnail,
    ...(details.screenshots || []).map((image) => image.image),
  ].filter((img): img is string => Boolean(img)).slice(0, 3);

  return {
    ...details,
    name: details.title,
    images,
    released: details.release_date || 'Sin fecha',
    developer: details.developer || 'Desarrollador no disponible',
    description: stripHtml(details.description || details.short_description),
  };
}