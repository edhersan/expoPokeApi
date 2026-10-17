// ──────────────────────────────────────────────────────────────
// ARCHIVO:  context/PokemonSearchContext.tsx
// FUNCIÓN:  Estado global de búsqueda de Pokémon (query, resultado, loading, error)
//           con estrategia offline-first: busca primero en la caché SQLite (instantáneo,
//           funciona sin red) y refresca de la API en segundo plano cuando hay conexión.
// DEPENDE:  constants/pokemon.ts (INITIAL_POKEMON), services/pokemonApi.ts,
//           services/pokemonRepo.ts (caché local), services/syncEngine.ts (catálogo)
// USADO POR: app/(tabs)/pokedex.tsx y app/(tabs)/pokemon-info.tsx (comparten el mismo estado)
// CAMBIOS:  búsqueda local → findPokemonLocal | catálogo → syncPokemonCatalog |
//           mensajes de error → getSearchErrorMessage
// NOTA:     En web (sin SQLite) se mantiene el comportamiento online clásico.
// ──────────────────────────────────────────────────────────────

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { INITIAL_POKEMON } from '@/constants/pokemon';
import { isDatabaseSupported } from '@/services/db';
import { fetchPokemonByQuery } from '@/services/pokemonApi';
import { findPokemonLocal, upsertPokemonLocal } from '@/services/pokemonRepo';
import { syncPokemonCatalog } from '@/services/syncEngine';
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

// Traduce los errores de la búsqueda a mensajes amigables en español.
// Si no fue un 404 ni una búsqueda vacía, la causa típica es la falta de red.
function getSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message === 'EMPTY_QUERY') {
    return 'Escribe un nombre o un ID para buscar.';
  }
  if (message === 'POKEMON_NOT_FOUND') {
    return 'No encontramos ese Pokémon. Revisa el nombre o el ID.';
  }
  return 'Sin conexión y ese Pokémon no está guardado en este dispositivo.';
}

// Provider: guarda el estado de búsqueda y lo comparte entre todas las pantallas
// que se monten dentro (ambas pestañas de Pokémon ven el mismo resultado)
export function PokemonSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(INITIAL_POKEMON);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ejecuta la búsqueda: caché local primero y, si hay red, refresco en segundo plano
  async function searchPokemon(value = query) {
    setQuery(value);
    setLoading(true);
    setError('');

    const clean = value.trim();
    if (!clean) {
      setPokemon(null);
      setError('Escribe un nombre o un ID para buscar.');
      setLoading(false);
      return;
    }

    // Web: sin caché local → se consulta la API directamente (comportamiento clásico)
    if (!isDatabaseSupported) {
      try {
        setPokemon(await fetchPokemonByQuery(value));
      } catch (searchError) {
        console.error('[PokemonSearchContext] Web search failed:', searchError);
        setPokemon(null);
        setError(getSearchErrorMessage(searchError));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Nativo: primero la copia guardada en SQLite (instantáneo, funciona sin red)...
    let local: Pokemon | null = null;
    try {
      local = await findPokemonLocal(clean);
      if (local) {
        setPokemon(local);
        setLoading(false);
      }
    } catch (cacheError) {
      console.error('[PokemonSearchContext] Local lookup failed:', cacheError);
    }

    // ...y después se refresca de la API. Si ya se mostró la copia local, un fallo
    // de red no interrumpe la vista: se sigue mostrando lo guardado
    try {
      const remote = await fetchPokemonByQuery(value);
      setPokemon(remote);
      setError('');
      await upsertPokemonLocal(remote);
    } catch (searchError) {
      console.error('[PokemonSearchContext] Remote search failed:', searchError);
      if (!local) {
        setPokemon(null);
        setError(getSearchErrorMessage(searchError));
      }
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial: busca el Pokémon definido en INITIAL_POKEMON y, en paralelo,
  // sincroniza el catálogo completo en segundo plano (silencioso)
  useEffect(() => {
    console.log('[PokemonSearchContext] Initial load for:', INITIAL_POKEMON);
    void searchPokemon(INITIAL_POKEMON);

    if (isDatabaseSupported) {
      void syncPokemonCatalog();
    }
  }, []);

  // Detección de reconexión: al volver la red se reconcilia el catálogo en silencio
  useEffect(() => {
    if (!isDatabaseSupported) {
      return;
    }

    const subscription = Network.addNetworkStateListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      if (online) {
        void syncPokemonCatalog();
      }
    });

    return () => subscription.remove();
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
