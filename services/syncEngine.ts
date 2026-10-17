// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/syncEngine.ts
// FUNCIÓN:  Motor de sincronización offline-first de los tres módulos:
//           - Profesores (SQLite): push de la cola local + pull reconciliado
//           - Pokémon (SQLite): solo pull reconciliado (catálogo de solo lectura)
//           - Juegos (archivo JSON, BD Mongo): solo pull reconciliado
//           Todo el proceso es silencioso para el usuario.
// DEPENDE:  expo-network, services/*Repo.ts, services/*Api.ts
// USADO POR: context/ProfessorsContext.tsx, context/PokemonSearchContext.tsx,
//            context/GameSearchContext.tsx
// CAMBIOS:  módulo nuevo → agregar su sección [SYNC] al final y su single-flight
// ──────────────────────────────────────────────────────────────

import * as Network from 'expo-network';
import { isDatabaseSupported } from '@/services/db';
import {
  deleteSyncedNotIn,
  discardLocalProfessor,
  getMetaValue,
  listQueue,
  markSynced,
  ProfessorRecord,
  removeQueueItem,
  setMetaValue,
  upsertFromRemote,
} from '@/services/professorsRepo';
import {
  createProfessor,
  deleteProfessor,
  fetchRawProfessors,
  ProfessorsApiError,
  ProfessorUpdatePayload,
  updateProfessor as updateProfessorRemote,
} from '@/services/profesoresApi';
import { fetchPokemonByQuery, fetchPokemonList } from '@/services/pokemonApi';
import {
  deletePokemonNotIn,
  getPokemonPayloadLocal,
  upsertPokemonLocal,
} from '@/services/pokemonRepo';
import { fetchGameByQuery, fetchGamesList } from '@/services/juegosApi';
import {
  isGamesStoreSupported,
  readGamesCatalog,
  replaceGamesCatalog,
  seedGamesCatalogFromBundle,
  writeGamesCatalog,
} from '@/services/gamesRepo';

// Resultado de un ciclo de sincronización (para que el contexto decida el estado)
export interface SyncResult {
  ok: boolean;
  offline?: boolean;
  error?: unknown;
}

// ¿Hay conexión con internet ahora mismo?
export async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    // isInternetReachable puede ser null mientras se comprueba: contamos solo el false explícito
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

// ─── [SECCIÓN] PROFESORES · PUSH: sube a la API las operaciones locales pendientes (FIFO) ───

// Convierte la respuesta cruda de la API al registro que guarda la caché local
function toRecord(raw: Awaited<ReturnType<typeof fetchRawProfessors>>[number]): ProfessorRecord {
  return {
    remote_id: raw.id,
    nombre: raw.nombre,
    apellido: raw.apellido,
    resumen: raw.resumen,
    titulos: raw.titulos,
    experiencia_laboral: raw.experiencia_laboral,
    url_imagen: raw.url_imagen,
  };
}

async function processQueue(): Promise<void> {
  const queue = await listQueue();

  for (const item of queue) {
    const payload = item.payload ? (JSON.parse(item.payload) as ProfessorUpdatePayload) : null;

    try {
      if (item.operation === 'create' && payload) {
        // El servidor asigna el id real → se guarda para que las siguientes ops lo resuelvan
        const created = await createProfessor(payload);
        await markSynced(item.local_id, created.id);
        await removeQueueItem(item.id);
        continue;
      }

      if (item.operation === 'update' && payload && item.remote_id != null) {
        await updateProfessorRemote(item.remote_id, payload);
        await markSynced(item.local_id, item.remote_id);
        await removeQueueItem(item.id);
        continue;
      }

      if (item.operation === 'delete') {
        if (item.remote_id != null) {
          await deleteProfessor(item.remote_id);
        }
        await removeQueueItem(item.id);
      }
    } catch (error) {
      // 404 = el registro ya no existe en la nube (lo borraron desde otro dispositivo)
      const alreadyGone = error instanceof ProfessorsApiError && error.status === 404;

      if (alreadyGone && item.operation === 'delete') {
        // Ya no había nada que borrar: solo se descarta la operación
        await removeQueueItem(item.id);
        continue;
      }

      if (alreadyGone && item.operation === 'update') {
        // El borrado remoto gana: se descarta la edición local pendiente y la fila
        await discardLocalProfessor(item.local_id);
        continue;
      }

      // Cualquier otro fallo (red, servidor) corta el ciclo: la cola queda intacta
      throw error;
    }
  }
}

// Clave en la tabla `meta` que marca que la caché local ya se llenó una primera vez
const PROFESSORS_INIT_META = 'professors_initialized';

// ─── [SECCIÓN] PROFESORES · PULL: baja el directorio de la nube y reconcilia en silencio ───
async function refreshFromServer(): Promise<void> {
  // Las inserciones se marcan "NUEVO" solo si la caché ya fue inicializada antes:
  // en el primer pull todo el directorio es nuevo para el dispositivo y no se señala
  const initialized = (await getMetaValue(PROFESSORS_INIT_META)) != null;

  const remote = await fetchRawProfessors();

  for (const item of remote) {
    await upsertFromRemote(toRecord(item), { markNew: initialized });
  }

  // Los registros ya sincronizados que la nube ya no devuelve se eliminan localmente
  await deleteSyncedNotIn(remote.map((item) => item.id));

  // A partir de aquí, toda inserción nueva en la nube se marca con el badge "NUEVO"
  await setMetaValue(PROFESSORS_INIT_META, '1');
}

// ─── [SECCIÓN] PROFESORES · Ciclo completo ───
// 1) Sube pendientes locales → 2) Baja el estado de la nube. Si algo falla por red,
// la cola queda intacta y se reintenta en el próximo evento de conexión.
async function executeSync(): Promise<SyncResult> {
  if (!isDatabaseSupported) {
    return { ok: false };
  }

  if (!(await isOnline())) {
    return { ok: false, offline: true };
  }

  try {
    await processQueue();
    await refreshFromServer();
    await setMetaValue('last_synced_at', String(Date.now()));
    return { ok: true };
  } catch (error) {
    console.error('[SyncEngine] Sync failed:', error);
    return { ok: false, error };
  }
}

// Evita ciclos concurrentes (un solo push en vuelo); reutiliza la promesa activa
let syncInFlight: Promise<SyncResult> | null = null;

export function runSync(): Promise<SyncResult> {
  if (!syncInFlight) {
    syncInFlight = executeSync().finally(() => {
      syncInFlight = null;
    });
  }
  return syncInFlight;
}

// ─── [SECCIÓN] POKÉMON · PULL + reconciliación (SQLite, catálogo de solo lectura) ───
// Compara la ficha de cada Pokémon con la cacheada: altas y modificaciones se
// guardan; los que la nube ya no devuelve se borran localmente.
async function executePokemonSync(): Promise<SyncResult> {
  if (!isDatabaseSupported) {
    return { ok: false };
  }

  if (!(await isOnline())) {
    return { ok: false, offline: true };
  }

  try {
    const remoteList = await fetchPokemonList();

    for (const item of remoteList) {
      // La lista solo trae id/nombre; el detalle se baja para comparar la ficha completa
      const pokemon = await fetchPokemonByQuery(String(item.id));
      const localPayload = await getPokemonPayloadLocal(item.id);

      if (JSON.stringify(pokemon) !== localPayload) {
        await upsertPokemonLocal(pokemon);
      }
    }

    await deletePokemonNotIn(remoteList.map((item) => item.id));
    await setMetaValue('last_synced_pokemon', String(Date.now()));
    return { ok: true };
  } catch (error) {
    console.error('[SyncEngine] Pokemon sync failed:', error);
    return { ok: false, error };
  }
}

let pokemonSyncInFlight: Promise<SyncResult> | null = null;

export function syncPokemonCatalog(): Promise<SyncResult> {
  if (!pokemonSyncInFlight) {
    pokemonSyncInFlight = executePokemonSync().finally(() => {
      pokemonSyncInFlight = null;
    });
  }
  return pokemonSyncInFlight;
}

// ─── [SECCIÓN] JUEGOS · PULL + reconciliación (archivo JSON, BD Mongo) ───
// La nube (Mongo) es la fuente de verdad: se baja el catálogo completo, se compara
// con el archivo local y, si cambió, se reescribe (altas, modificaciones y borrados).
async function executeGamesSync(): Promise<SyncResult> {
  if (!isGamesStoreSupported) {
    return { ok: false };
  }

  if (!(await isOnline())) {
    return { ok: false, offline: true };
  }

  try {
    // Primer arranque: parte del catálogo empaquetado (assets/games-seed.json)
    await seedGamesCatalogFromBundle();

    const titles = await fetchGamesList();
    const remoteGames = [];

    for (const title of titles) {
      remoteGames.push(await fetchGameByQuery(title));
    }

    const current = await readGamesCatalog();

    if (JSON.stringify(current.games) !== JSON.stringify(remoteGames)) {
      console.log(
        `[SyncEngine] Games catalog changed: ${current.games.length} → ${remoteGames.length}`,
      );
      await replaceGamesCatalog(remoteGames);
    } else {
      // Sin cambios de contenido: solo se sella la fecha de verificación
      await writeGamesCatalog(current.games, Date.now());
    }

    return { ok: true };
  } catch (error) {
    console.error('[SyncEngine] Games sync failed:', error);
    return { ok: false, error };
  }
}

let gamesSyncInFlight: Promise<SyncResult> | null = null;

export function syncGamesCatalog(): Promise<SyncResult> {
  if (!gamesSyncInFlight) {
    gamesSyncInFlight = executeGamesSync().finally(() => {
      gamesSyncInFlight = null;
    });
  }
  return gamesSyncInFlight;
}
