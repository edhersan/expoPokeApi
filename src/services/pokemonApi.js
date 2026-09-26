import { API_URL } from '../constants/pokemon';

// Centraliza la comunicación con PokéAPI para que los componentes no conozcan URLs ni fetch.
export async function fetchPokemonByQuery(query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    // Usamos un código estable para que la pantalla pueda mostrar un mensaje específico.
    throw new Error('EMPTY_QUERY');
  }

  const response = await fetch(`${API_URL}${encodeURIComponent(cleanQuery)}`);
  if (!response.ok) {
    // Cualquier respuesta 4xx/5xx se convierte en un error de búsqueda controlable.
    throw new Error('POKEMON_NOT_FOUND');
  }

  const pokemon = await response.json();
  const speciesResponse = await fetch(pokemon.species.url);

  if (!speciesResponse.ok) {
    throw new Error('POKEMON_NOT_FOUND');
  }

  const species = await speciesResponse.json();
  const descriptionEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en',
  );

  return {
    ...pokemon,
    description: descriptionEntry?.flavor_text.replace(/[\n\f]/g, ' ') || 'No hay descripción disponible.',
  };
}
