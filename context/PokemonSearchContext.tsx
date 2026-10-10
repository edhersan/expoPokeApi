// ──────────────────────────────────────────────────────────────
// ARCHIVO:  context/PokemonSearchContext.tsx
// FUNCIÓN:  Estado global de búsqueda de Pokémon (query, resultado, loading, error)
// DEPENDE:  constants/pokemon.ts (INITIAL_POKEMON), services/pokemonApi.ts
// USADO POR: app/(tabs)/pokedex.tsx y app/(tabs)/pokemon-info.tsx (comparten el mismo estado)
// CAMBIOS:  Pokémon inicial → constants/pokemon.ts | mensajes de error → getSearchErrorMessage
// ──────────────────────────────────────────────────────────────

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { INITIAL_POKEMON } from '@/constants/pokemon';
import { fetchPokemonByQuery } from '@/services/pokemonApi';
import { Pokemon } from '@/types';

// Contrato del contexto: lo que expone `usePokemonSearch()` a las pantallas
interface PokemonSearchContextValue {
  query: string;
  pokemon: Pokemon | null;
  loading: boolean;
  error: string;
  setQuery: (value: string) => void;
  searchPokemon: (value?: string) => Promise<void>;
}

// Contexto nullable: si el hook se usa fuera del Provider lanza error (ver usePokemonSearch)
const PokemonSearchContext = createContext<PokemonSearchContextValue | null>(null);

// Traduce los códigos de error de los servicios a mensajes amigables en español
function getSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  return message === 'EMPTY_QUERY'
    ? 'Escribe un nombre o un ID para buscar.'
    : 'No encontramos ese Pokémon. Revisa el nombre o el ID.';
}

// Provider: guarda el estado de búsqueda y lo comparte entre todas las pantallas
// que se monten dentro (ambas pestañas de Pokémon ven el mismo resultado)
export function PokemonSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(INITIAL_POKEMON);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ejecuta la búsqueda: limpia errores, llama a la API y guarda el resultado
  async function searchPokemon(value = query) {
    setQuery(value);
    setLoading(true);
    setError('');

    try {
      console.log('[PokemonSearchContext] Searching for:', value);
      const result = await fetchPokemonByQuery(value);
      console.log('[PokemonSearchContext] Got result:', result.name);
      setPokemon(result);
    } catch (searchError) {
      console.error('[PokemonSearchContext] Search failed:', searchError);
      setPokemon(null);
      setError(getSearchErrorMessage(searchError));
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial: trae el Pokémon definido en INITIAL_POKEMON al montar la app
  useEffect(() => {
    console.log('[PokemonSearchContext] Initial load for:', INITIAL_POKEMON);
    void searchPokemon(INITIAL_POKEMON);
  }, []);

  return (
    <PokemonSearchContext.Provider value={{ query, pokemon, loading, error, setQuery, searchPokemon }}>
      {children}
    </PokemonSearchContext.Provider>
  );
}

// Hook de consumo: obliga a que exista PokemonSearchProvider por encima
export function usePokemonSearch() {
  const context = useContext(PokemonSearchContext);
  if (!context) {
    throw new Error('usePokemonSearch must be used within PokemonSearchProvider');
  }
  return context;
}
