import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { INITIAL_POKEMON } from '@/constants/pokemon';
import { fetchPokemonByQuery } from '@/services/pokemonApi';
import { Pokemon } from '@/types';

interface PokemonSearchContextValue {
  query: string;
  pokemon: Pokemon | null;
  loading: boolean;
  error: string;
  setQuery: (value: string) => void;
  searchPokemon: (value?: string) => Promise<void>;
}

const PokemonSearchContext = createContext<PokemonSearchContextValue | null>(null);

function getSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  return message === 'EMPTY_QUERY'
    ? 'Escribe un nombre o un ID para buscar.'
    : 'No encontramos ese Pokémon. Revisa el nombre o el ID.';
}

export function PokemonSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(INITIAL_POKEMON);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function searchPokemon(value = query) {
    setQuery(value);
    setLoading(true);
    setError('');

    try {
      const result = await fetchPokemonByQuery(value);
      setPokemon(result);
    } catch (searchError) {
      setPokemon(null);
      setError(getSearchErrorMessage(searchError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void searchPokemon(INITIAL_POKEMON);
  }, []);

  return (
    <PokemonSearchContext.Provider value={{ query, pokemon, loading, error, setQuery, searchPokemon }}>
      {children}
    </PokemonSearchContext.Provider>
  );
}

export function usePokemonSearch() {
  const context = useContext(PokemonSearchContext);
  if (!context) {
    throw new Error('usePokemonSearch must be used within PokemonSearchProvider');
  }
  return context;
}
