// ──────────────────────────────────────────────────────────────
// ARCHIVO:  context/ProfessorsContext.tsx
// FUNCIÓN:  Estado global del directorio de profesores con estrategia offline-first:
//           arranca siempre desde SQLite y sincroniza en segundo plano cuando hay red.
// DEPENDE:  services/db.ts, services/professorsRepo.ts, services/syncEngine.ts,
//           services/profesoresApi.ts (fallback web)
// USADO POR: app/(tabs)/profesor.tsx (envuelto en app/_layout.tsx)
// CAMBIOS:  mutaciones → create/update/deleteProfessor | red → expo-network listener |
//           monitoreo de la nube → pollIntervalMs/setPollInterval (2 s / 10 s / 30 s) |
//           inserciones nuevas → newCount + markProfessorSeen (badge "NUEVO")
// NOTA:     En web (sin SQLite) cae al comportamiento online clásico contra la API.
// ──────────────────────────────────────────────────────────────

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Network from 'expo-network';
import { isDatabaseSupported } from '@/services/db';
import {
  createProfessorLocal,
  deleteProfessorLocal,
  getMetaValue,
  getPendingCount,
  listProfessorsLocal,
  markProfessorSeen as markProfessorSeenLocal,
  setMetaValue,
  updateProfessorLocal,
} from '@/services/professorsRepo';
import { runSync } from '@/services/syncEngine';
import {
  createProfessor as createProfessorRemote,
  deleteProfessor as deleteProfessorRemote,
  fetchProfessors,
  ProfessorUpdatePayload,
  updateProfessor as updateProfessorRemote,
} from '@/services/profesoresApi';
import { describeError } from '@/components/profesor/profesorTypes';
import { Professor } from '@/types';

// Opciones de monitoreo automático de la nube que puede elegir el usuario (ms)
export const POLL_INTERVAL_OPTIONS = [2000, 10000, 30000] as const;

// Intervalo por defecto del monitoreo automático (10 segundos)
export const DEFAULT_POLL_INTERVAL_MS = 10_000;

// Clave de la tabla `meta` donde se persiste la preferencia del usuario
const POLL_INTERVAL_META = 'poll_interval_ms';

// Contrato del contexto: lo que expone `useProfessors()` a las pantallas
interface ProfessorsContextValue {
  professors: Professor[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  isOffline: boolean;
  pendingCount: number;
  newCount: number;
  lastSyncedAt: number | null;
  pollIntervalMs: number;
  createProfessor: (payload: ProfessorUpdatePayload) => Promise<Professor>;
  updateProfessor: (professor: Professor, payload: ProfessorUpdatePayload) => Promise<Professor>;
  deleteProfessor: (professor: Professor) => Promise<void>;
  markProfessorSeen: (professor: Professor) => Promise<void>;
  setPollInterval: (intervalMs: number) => Promise<void>;
  syncNow: () => Promise<void>;
}

const ProfessorsContext = createContext<ProfessorsContextValue | null>(null);

// ¿El estado de red indica conexión con internet?
function isConnected(state: Network.NetworkState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function ProfessorsProvider({ children }: { children: ReactNode }) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [pollIntervalMs, setPollIntervalMs] = useState(DEFAULT_POLL_INTERVAL_MS);

  // Inserciones de la nube aún no vistas (badge "NUEVO" en el directorio)
  const newCount = professors.filter((professor) => professor.isNew).length;

  // Relee el directorio desde SQLite (operación local, instantánea)
  const refreshLocal = useCallback(async () => {
    const [list, pending] = await Promise.all([listProfessorsLocal(), getPendingCount()]);
    setProfessors(list);
    setPendingCount(pending);
  }, []);

  // Ejecuta un ciclo de sincronización y refresca el estado local
  const syncAndReload = useCallback(async () => {
    const result = await runSync();
    setIsOffline(result.offline === true);
    await refreshLocal();

    const last = await getMetaValue('last_synced_at');
    setLastSyncedAt(last ? Number(last) : null);
  }, [refreshLocal]);

  // ─── [SECCIÓN] Carga inicial ───
  useEffect(() => {
    let active = true;

    (async () => {
      // Web: no hay SQLite → se usa directamente la API (sin caché offline)
      if (!isDatabaseSupported) {
        try {
          const list = await fetchProfessors();
          if (active) setProfessors(list);
        } catch (loadError) {
          console.error('[ProfessorsContext] Web load failed:', loadError);
          if (active) setError(describeError(loadError));
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      // Nativo: primero local (la app abre sin depender de la red)...
      try {
        await refreshLocal();
      } catch (loadError) {
        console.error('[ProfessorsContext] Local load failed:', loadError);
        if (active) setError(describeError(loadError));
      } finally {
        if (active) setLoading(false);
      }

      // ...y luego sincroniza en segundo plano si hay red
      if (active) {
        void syncAndReload();
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshLocal, syncAndReload]);

  // ─── [SECCIÓN] Detección de reconexión ───
  useEffect(() => {
    if (!isDatabaseSupported) {
      return;
    }

    const subscription = Network.addNetworkStateListener((state) => {
      const online = isConnected(state);
      setIsOffline(!online);

      // Al volver la conexión, se dispara la sincronización silenciosa
      if (online) {
        void syncAndReload();
      }
    });

    return () => subscription.remove();
  }, [syncAndReload]);

  // ─── [SECCIÓN] Monitoreo periódico de la nube (intervalo parametrizable) ───

  // Restaura la preferencia guardada del usuario (por defecto: 10 s)
  useEffect(() => {
    if (!isDatabaseSupported) {
      return;
    }

    void (async () => {
      const saved = await getMetaValue(POLL_INTERVAL_META);
      if (saved) {
        setPollIntervalMs(Number(saved));
      }
    })();
  }, []);

  // Cada intervalo se comprueba la nube en silencio: las inserciones o cambios
  // hechos directamente en la BD se reflejan en SQLite. Se pausa con la app en
  // segundo plano y sin conexión (el single-flight del motor evita solapes).
  useEffect(() => {
    if (!isDatabaseSupported) {
      return;
    }

    const interval = setInterval(() => {
      if (AppState.currentState === 'active' && !isOffline) {
        void syncAndReload();
      }
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [pollIntervalMs, isOffline, syncAndReload]);

  // Cambia el intervalo de monitoreo y lo persiste para próximos arranques
  const setPollInterval = useCallback(async (intervalMs: number) => {
    setPollIntervalMs(intervalMs);
    await setMetaValue(POLL_INTERVAL_META, String(intervalMs));
  }, []);

  // ─── [SECCIÓN] Mutaciones (siempre locales primero; sync si hay red) ───

  const createProfessor = useCallback(
    async (payload: ProfessorUpdatePayload): Promise<Professor> => {
      if (!isDatabaseSupported) {
        const created = await createProfessorRemote(payload);
        setProfessors((prev) => [created, ...prev]);
        return created;
      }

      const created = await createProfessorLocal(payload);
      setProfessors((prev) => [created, ...prev]);
      setPendingCount((prev) => prev + 1);
      void syncAndReload();
      return created;
    },
    [syncAndReload],
  );

  const updateProfessor = useCallback(
    async (professor: Professor, payload: ProfessorUpdatePayload): Promise<Professor> => {
      if (!isDatabaseSupported) {
        const updated = await updateProfessorRemote(professor.id, payload);
        setProfessors((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        return updated;
      }

      const updated = await updateProfessorLocal(professor, payload);
      await refreshLocal();
      void syncAndReload();
      return updated;
    },
    [refreshLocal, syncAndReload],
  );

  const deleteProfessor = useCallback(
    async (professor: Professor): Promise<void> => {
      if (!isDatabaseSupported) {
        await deleteProfessorRemote(professor.id);
        setProfessors((prev) => prev.filter((item) => item.id !== professor.id));
        return;
      }

      await deleteProfessorLocal(professor);
      setProfessors((prev) => prev.filter((item) => item.id !== professor.id));
      void syncAndReload();
    },
    [syncAndReload],
  );

  // Sincronización manual (botón "Sincronizar"); no bloquea la UI
  const syncNow = useCallback(async () => {
    if (!isDatabaseSupported) {
      return;
    }

    setSyncing(true);
    try {
      await syncAndReload();
    } finally {
      setSyncing(false);
    }
  }, [syncAndReload]);

  // Quita el badge "NUEVO" al abrir la ficha (se marca como visto en SQLite)
  const markProfessorSeen = useCallback(async (professor: Professor): Promise<void> => {
    if (!isDatabaseSupported) {
      return;
    }

    await markProfessorSeenLocal(professor);
    setProfessors((prev) =>
      prev.map((item) => (item.id === professor.id ? { ...item, isNew: false } : item)),
    );
  }, []);

  return (
    <ProfessorsContext.Provider
      value={{
        professors,
        loading,
        syncing,
        error,
        isOffline,
        pendingCount,
        newCount,
        lastSyncedAt,
        pollIntervalMs,
        createProfessor,
        updateProfessor,
        deleteProfessor,
        markProfessorSeen,
        setPollInterval,
        syncNow,
      }}
    >
      {children}
    </ProfessorsContext.Provider>
  );
}

// Hook de consumo: obliga a que exista ProfessorsProvider por encima
export function useProfessors() {
  const context = useContext(ProfessorsContext);
  if (!context) {
    throw new Error('useProfessors must be used within ProfessorsProvider');
  }
  return context;
}
