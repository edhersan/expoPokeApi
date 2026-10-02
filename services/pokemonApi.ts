import { API_URL } from '@/constants/pokemon';
import { Pokemon } from '@/types';

export async function fetchPokemonByQuery(query: string): Promise<Pokemon> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    throw new Error('EMPTY_QUERY');
  }

  const response = await fetch(`${API_URL}${encodeURIComponent(cleanQuery)}`);
  if (!response.ok) {
    throw new Error('POKEMON_NOT_FOUND');
  }

  const pokemon = await response.json();
  const speciesResponse = await fetch(pokemon.species.url);

  if (!speciesResponse.ok) {
    throw new Error('POKEMON_NOT_FOUND');
  }

  const species = await speciesResponse.json();
  const descriptionEntry = species.flavor_text_entries.find(
    (entry: { language: { name: string }; flavor_text: string }) => entry.language.name === 'en',
  );

  return {
    ...pokemon,
    description: descriptionEntry?.flavor_text.replace(/[\n\f]/g, ' ') || 'No hay descripción disponible.',
  };
}