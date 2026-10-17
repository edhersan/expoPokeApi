// ──────────────────────────────────────────────────────────────
// ARCHIVO:  context/GameSearchContext.tsx
// FUNCIÓN:  Estado global de búsqueda de videojuegos (query, resultado, loading, error)
//           con estrategia offline-first: busca primero en el catálogo JSON local
//           (instantáneo, funciona sin red) y refresca de la API en segundo plano.
// DEPENDE:  constants/freetogame.ts (INITIAL_GAME), services/juegosApi.ts,
//           services/gamesRepo.ts (catálogo local en archivo), services/syncEngine.ts
// USADO POR: app/(tabs)/games.tsx y app/(tabs)/game-info.tsx (comparten el mismo estado)
// CAMBIOS:  búsqueda local → findGameLocal | catálogo → syncGamesCatalog |
//           mensajes de error → getSearchErrorMessage | respaldo web → findGameInSeed
// NOTA:     En web (sin catálogo en archivo) la búsqueda usa primero el seed empaquetado
//           y, si el juego no está ahí, intenta la API (sujeta a CORS del navegador).
// ──────────────────────────────────────────────────────────────

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { INITIAL_GAME } from '@/constants/freetogame';
import { fetchGameByQuery } from '@/services/juegosApi';
import {
  findGameInSeed,
  findGameLocal,
  isGamesStoreSupported,
  seedGamesCatalogFromBundle,
  upsertGameLocal,
} from '@/services/gamesRepo';
import { syncGamesCatalog } from '@/services/syncEngine';
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

// Traduce los errores de la búsqueda a mensajes amigables en español.
// Si no fue un 404 ni una búsqueda vacía, la causa típica es la falta de red.
function getSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message === 'EMPTY_QUERY') {
    return 'Escribe el nombre de un videojuego para buscar.';
  }
  if (message === 'GAME_NOT_FOUND') {
    return 'No encontramos ese videojuego en el catálogo.';
  }
  return 'Sin conexión y ese videojuego no está guardado en este dispositivo.';
}

// Provider: guarda el estado de búsqueda y lo comparte entre todas las pantallas
// que se monten dentro (ambas pestañas de juegos ven el mismo resultado)
export function GameSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(INITIAL_GAME);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ejecuta la búsqueda: catálogo local primero y, si hay red, refresco en segundo plano
  async function searchGame(value = query) {
    setQuery(value);
    setLoading(true);
    setError('');

    const clean = value.trim();
    if (!clean) {
      setGame(null);
      setError('Escribe el nombre de un videojuego para buscar.');
      setLoading(false);
      return;
    }

    // Web: no hay catálogo en archivo → primero el seed empaquetado (sin red); si el
    // juego no está ahí se intenta la API, que el navegador puede bloquear por CORS
    if (!isGamesStoreSupported) {
      const local = findGameInSeed(clean);

      if (local) {
        setGame(local);
        setLoading(false);
        return;
      }

      try {
        setGame(await fetchGameByQuery(value));
      } catch (searchError) {
        console.warn('[GameSearchContext] Web search without local match failed:', searchError);
        setGame(null);
        setError(getSearchErrorMessage(searchError));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Nativo: primero la copia guardada en el catálogo JSON (instantáneo, sin red)...
    let local: Game | null = null;
    try {
      local = await findGameLocal(clean);
      if (local) {
        setGame(local);
        setLoading(false);
      }
    } catch (cacheError) {
      console.error('[GameSearchContext] Local lookup failed:', cacheError);
    }

    // ...y después se refresca de la API. Si ya se mostró la copia local, un fallo
    // de red no interrumpe la vista: se sigue mostrando lo guardado
    try {
      const remote = await fetchGameByQuery(value);
      setGame(remote);
      setError('');
      await upsertGameLocal(remote);
    } catch (searchError) {
      console.error('[GameSearchContext] Remote search failed:', searchError);
      if (!local) {
        setGame(null);
        setError(getSearchErrorMessage(searchError));
      }
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial: siembra el catálogo empaquetado si es el primer arranque, busca el
  // juego definido en INITIAL_GAME y sincroniza el catálogo en segundo plano
  useEffect(() => {
    console.log('[GameSearchContext] Initial load for:', INITIAL_GAME);

    if (!isGamesStoreSupported) {
      void searchGame(INITIAL_GAME);
      return;
    }

    void (async () => {
      try {
        await seedGamesCatalogFromBundle();
      } catch (seedError) {
        console.error('[GameSearchContext] Seed failed:', seedError);
      }

      await searchGame(INITIAL_GAME);
      void syncGamesCatalog();
    })();
  }, []);

  // Detección de reconexión: al volver la red se reconcilia el catálogo en silencio
  useEffect(() => {
    if (!isGamesStoreSupported) {
      return;
    }

    const subscription = Network.addNetworkStateListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      if (online) {
        void syncGamesCatalog();
      }
    });

    return () => subscription.remove();
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
