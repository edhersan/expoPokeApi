// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/pokemonApi.ts
// FUNCIÓN:  Conexión con la API de Pokémon (consulta y normalización)
// DEPENDE:  constants/pokemon.ts (API_URL), types/index.ts (Pokemon)
// USADO POR: context/PokemonSearchContext.tsx → pantallas "Pokédex" e "Info Pokémon"
// CAMBIOS:  URL base → constants/pokemon.ts | conversiones de altura/peso → mapeo de respuesta
// ──────────────────────────────────────────────────────────────

import { API_URL } from '@/constants/pokemon';
import { Pokemon } from '@/types';

// Busca un Pokémon por nombre o ID y devuelve su ficha ya normalizada al tipo `Pokemon`.
// Lanza: 'EMPTY_QUERY' si la búsqueda está vacía | 'POKEMON_NOT_FOUND' si la API no lo encuentra
export async function fetchPokemonByQuery(query: string): Promise<Pokemon> {
  // Limpia la búsqueda: quita espacios y pasa a minúsculas (la API es case-sensitive)
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    throw new Error('EMPTY_QUERY');
  }

  // Endpoint: {API_URL}/pokemon/{nombre-o-id}
  const url = `${API_URL}/pokemon/${encodeURIComponent(cleanQuery)}`;
  console.log('[PokemonAPI] Fetching:', url);

  try {
    const response = await fetch(url);
    console.log('[PokemonAPI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PokemonAPI] Error response:', errorText);
      throw new Error('POKEMON_NOT_FOUND');
    }

    // Respuesta cruda de la API (campos propios, distintos del estándar de PokéAPI)
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

    console.log('[PokemonAPI] Success:', pokemon.name);

    // ─── [SECCIÓN] Mapeo a la interfaz Pokemon ───
    // Conversión de unidades: la API da metros/kg → la app guarda cm/g (* 10)
    // La UI vuelve a dividir entre 10 al mostrar (ver PokemonCard / PokemonDetails)
    return {
      id: pokemon.id,
      name: pokemon.name,
      height: Math.round(Number(pokemon.height_m) * 10),
      weight: Math.round(Number(pokemon.weight_kg) * 10),
      // Se reestructuran las imágenes al formato de sprites que usan los componentes
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
  } catch (error) {
    console.error('[PokemonAPI] Fetch failed:', error);
    throw error;
  }
}
