import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { INITIAL_GAME } from '@/constants/freetogame';
import { fetchGameByQuery } from '@/services/juegosApi';
import { Game } from '@/types';

interface GameSearchContextValue {
  query: string;
  game: Game | null;
  loading: boolean;
  error: string;
  setQuery: (value: string) => void;
  searchGame: (value?: string) => Promise<void>;
}

const GameSearchContext = createContext<GameSearchContextValue | null>(null);

function getSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  return message === 'EMPTY_QUERY'
    ? 'Escribe el nombre de un videojuego para buscar.'
    : 'No encontramos ese videojuego en el catálogo.';
}

export function GameSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(INITIAL_GAME);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function searchGame(value = query) {
    setQuery(value);
    setLoading(true);
    setError('');

    try {
      const result = await fetchGameByQuery(value);
      setGame(result);
    } catch (searchError) {
      setGame(null);
      setError(getSearchErrorMessage(searchError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void searchGame(INITIAL_GAME);
  }, []);

  return (
    <GameSearchContext.Provider value={{ query, game, loading, error, setQuery, searchGame }}>
      {children}
    </GameSearchContext.Provider>
  );
}

export function useGameSearch() {
  const context = useContext(GameSearchContext);
  if (!context) {
    throw new Error('useGameSearch must be used within GameSearchProvider');
  }
  return context;
}
