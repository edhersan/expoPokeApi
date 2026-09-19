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

  return response.json();
}
