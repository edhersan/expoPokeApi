import { API_URL } from '@/constants/pokemon';
import { Pokemon } from '@/types';

export async function fetchPokemonByQuery(query: string): Promise<Pokemon> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    throw new Error('EMPTY_QUERY');
  }

  const response = await fetch(`${API_URL}/pokemon/${encodeURIComponent(cleanQuery)}`);
  if (!response.ok) {
    throw new Error('POKEMON_NOT_FOUND');
  }

  const pokemon = await response.json() as {
    id: number;
    name: string;
    height_m: string | number;
    weight_kg: string | number;
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    official_artwork_front: string | null;
    dream_world_front: string | null;
    moves: string[];
  };

  return {
    id: pokemon.id,
    name: pokemon.name,
    height: Math.round(Number(pokemon.height_m) * 10),
    weight: Math.round(Number(pokemon.weight_kg) * 10),
    sprites: {
      front_default: pokemon.front_default,
      front_shiny: pokemon.front_shiny,
      back_default: pokemon.back_default,
      other: {
        'official-artwork': { front_default: pokemon.official_artwork_front },
        dream_world: { front_default: pokemon.dream_world_front },
      },
    },
    moves: pokemon.moves.map((name) => ({ move: { name } })),
    description: 'No hay descripción disponible.',
  };
}