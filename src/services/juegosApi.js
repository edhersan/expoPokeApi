import { FREETOGAME_API_URL } from '../constants/freetogame';

async function fetchFreeToGame(path, params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const response = await fetch(`${FREETOGAME_API_URL}${path}${query}`);

  if (!response.ok) {
    throw new Error('GAME_NOT_FOUND');
  }

  return response.json();
}

function stripHtml(value) {
  return (value || 'No hay descripción disponible.')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchGameByQuery(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error('EMPTY_QUERY');
  }

  const games = await fetchFreeToGame('/games');
  const game = games.find((item) => item.title.toLowerCase().includes(cleanQuery.toLowerCase()));
  if (!game) {
    throw new Error('GAME_NOT_FOUND');
  }

  const details = await fetchFreeToGame('/game', { id: String(game.id) });

  const images = [
    details.thumbnail,
    ...(details.screenshots || []).map((image) => image.image),
  ].filter(Boolean).slice(0, 3);

  return {
    ...details,
    name: details.title,
    images,
    released: details.release_date || 'Sin fecha',
    developer: details.developer || 'Desarrollador no disponible',
    description: stripHtml(details.description || details.short_description),
  };
}