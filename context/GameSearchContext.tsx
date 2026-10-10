// ──────────────────────────────────────────────────────────────
// ARCHIVO:  context/GameSearchContext.tsx
// FUNCIÓN:  Estado global de búsqueda de videojuegos (query, resultado, loading, error)
// DEPENDE:  constants/freetogame.ts (INITIAL_GAME), services/juegosApi.ts
// USADO POR: app/(tabs)/games.tsx y app/(tabs)/game-info.tsx (comparten el mismo estado)
// CAMBIOS:  Juego inicial → constants/freetogame.ts | mensajes de error → getSearchErrorMessage
// ──────────────────────────────────────────────────────────────

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { INITIAL_GAME } from '@/constants/freetogame';
import { fetchGameByQuery } from '@/services/juegosApi';
import { Game } from '@/types';

// Contrato del contexto: lo que expone `useGameSearch()` a las pantallas
interface GameSearchContextValue {
  query: string;
  game: Game | null;
  loading: boolean;
  error: string;
  setQuery: (value: string) => void;
  searchGame: (value?: string) => Promise<void>;
}

// Contexto nullable: si el hook se usa fuera del Provider lanza error (ver useGameSearch)
const GameSearchContext = createContext<GameSearchContextValue | null>(null);

// Traduce los códigos de error de los servicios a mensajes amigables en español
function getSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  return message === 'EMPTY_QUERY'
    ? 'Escribe el nombre de un videojuego para buscar.'
    : 'No encontramos ese videojuego en el catálogo.';
}

// Provider: guarda el estado de búsqueda y lo comparte entre todas las pantallas
// que se monten dentro (ambas pestañas de juegos ven el mismo resultado)
export function GameSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(INITIAL_GAME);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ejecuta la búsqueda: limpia errores, llama a la API y guarda el resultado
  async function searchGame(value = query) {
    setQuery(value);
    setLoading(true);
    setError('');

    try {
      console.log('[GameSearchContext] Searching for:', value);
      const result = await fetchGameByQuery(value);
      console.log('[GameSearchContext] Got result:', result.name);
      setGame(result);
    } catch (searchError) {
      console.error('[GameSearchContext] Search failed:', searchError);
      setGame(null);
      setError(getSearchErrorMessage(searchError));
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial: trae el juego definido en INITIAL_GAME al montar la app
  useEffect(() => {
    console.log('[GameSearchContext] Initial load for:', INITIAL_GAME);
    void searchGame(INITIAL_GAME);
  }, []);

  return (
    <GameSearchContext.Provider value={{ query, game, loading, error, setQuery, searchGame }}>
      {children}
    </GameSearchContext.Provider>
  );
}

// Hook de consumo: obliga a que exista GameSearchProvider por encima
export function useGameSearch() {
  const context = useContext(GameSearchContext);
  if (!context) {
    throw new Error('useGameSearch must be used within GameSearchProvider');
  }
  return context;
}
