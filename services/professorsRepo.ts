// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/professorsRepo.ts
// FUNCIÓN:  Repositorio local del directorio de profesores (capa offline-first).
//           Todas las lecturas vienen de SQLite; las escrituras se guardan local
//           de inmediato y se encolan para subirlas a la API cuando haya red.
// DEPENDE:  services/db.ts, services/profesoresApi.ts (tipos), types/index.ts
// USADO POR: services/syncEngine.ts, context/ProfessorsContext.tsx
// CAMBIOS:  columnas → ProfessorRow / mapRow | operaciones de la cola → enqueue*
// ──────────────────────────────────────────────────────────────

import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '@/services/db';
import { ProfessorUpdatePayload, RawProfessor } from '@/services/profesoresApi';
import { Professor, SyncOperation } from '@/types';

// Fila de la tabla `professors` (nombres de columna en la BD)
export interface ProfessorRow {
  local_id: number;
  remote_id: number | null;
  nombre: string;
  apellido: string;
  resumen: string;
  titulos: string;
  experiencia_laboral: string;
  url_imagen: string;
  sync_status: 'synced' | 'pending';
  is_new: number;
  updated_at: number;
}

// Campos de un profesor tal como se guardan/cachean desde el backend
export interface ProfessorRecord {
  remote_id: number;
  nombre: string;
  apellido: string;
  resumen: string;
  titulos: string;
  experiencia_laboral: string;
  url_imagen: string;
}

// Divide el texto de títulos en lista (idéntico a services/profesoresApi.ts)
function splitTitles(titles: string): string[] {
  return titles
    .split(/[,;\n]+/)
    .map((title) => title.trim())
    .filter(Boolean);
}

// Convierte una fila de la BD al tipo `Professor` que consume la UI
// id = remote_id (recurso real) o -local_id (recurso aún no sincronizado)
function mapRow(row: ProfessorRow): Professor {
  return {
    id: row.remote_id ?? -row.local_id,
    nombre: row.nombre,
    apellido: row.apellido,
    name: `${row.nombre} ${row.apellido}`.trim(),
    specialty: row.titulos || 'Docente',
    experience: row.experiencia_laboral || 'Experiencia no disponible',
    bio: row.resumen || 'No hay resumen disponible.',
    subjects: splitTitles(row.titulos || 'Docencia'),
    imageUrl: row.url_imagen,
    pending: row.sync_status === 'pending',
    isNew: row.is_new === 1,
  };
}

// ─── [SECCIÓN] Lecturas (siempre desde SQLite) ───

// Lista completa del directorio cacheado, más recientes/modificados primero
export async function listProfessorsLocal(): Promise<Professor[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProfessorRow>(
    'SELECT * FROM professors ORDER BY updated_at DESC, local_id DESC',
  );
  return rows.map(mapRow);
}

// ¿Hay al menos un registro con cambios pendientes de subir?
export async function hasPendingChanges(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM sync_queue');
  return (row?.total ?? 0) > 0;
}

// Cuenta de operaciones pendientes en la cola de sincronización
export async function getPendingCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM sync_queue');
  return row?.total ?? 0;
}

// Cuenta de inserciones de la nube aún no vistas en este dispositivo (badge "NUEVO")
export async function getNewCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM professors WHERE is_new = 1',
  );
  return row?.total ?? 0;
}

// Resuelve el local_id de una fila a partir del id que ve la UI (negativo = local)
async function resolveLocalId(db: SQLiteDatabase, professor: Professor): Promise<number | null> {
  if (professor.id < 0) {
    return -professor.id;
  }
  const row = await db.getFirstAsync<{ local_id: number }>(
    'SELECT local_id FROM professors WHERE remote_id = ?',
    professor.id,
  );
  return row?.local_id ?? null;
}

// ─── [SECCIÓN] Escrituras locales (guardan + encolan) ───

// Crea un profesor localmente (id temporal) y encola la operación 'create'
export async function createProfessorLocal(payload: ProfessorUpdatePayload): Promise<Professor> {
  const db = await getDatabase();
  const now = Date.now();
  let localId = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO professors
        (remote_id, nombre, apellido, resumen, titulos, experiencia_laboral, url_imagen, sync_status, updated_at)
       VALUES (NULL, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        payload.nombre,
        payload.apellido,
        payload.resumen,
        payload.titulos,
        payload.experiencia_laboral,
        payload.url_imagen,
        now,
      ],
    );

    localId = result.lastInsertRowId;

    await db.runAsync(
      `INSERT INTO sync_queue (operation, local_id, remote_id, payload, created_at)
       VALUES ('create', ?, NULL, ?, ?)`,
      [localId, JSON.stringify(payload), now],
    );
  });

  return {
    id: -localId,
    nombre: payload.nombre,
    apellido: payload.apellido,
    name: `${payload.nombre} ${payload.apellido}`.trim(),
    specialty: payload.titulos || 'Docente',
    experience: payload.experiencia_laboral || 'Experiencia no disponible',
    bio: payload.resumen || 'No hay resumen disponible.',
    subjects: splitTitles(payload.titulos || 'Docencia'),
    imageUrl: payload.url_imagen,
    pending: true,
  };
}

// Actualiza un profesor localmente y encola (o fusiona) la operación 'update'
export async function updateProfessorLocal(
  professor: Professor,
  payload: ProfessorUpdatePayload,
): Promise<Professor> {
  const db = await getDatabase();
  const localId = await resolveLocalId(db, professor);
  if (localId == null) {
    throw new Error('PROFESSOR_NOT_FOUND_LOCAL');
  }

  const now = Date.now();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE professors
         SET nombre = ?, apellido = ?, resumen = ?, titulos = ?, experiencia_laboral = ?, url_imagen = ?,
             sync_status = 'pending', updated_at = ?
       WHERE local_id = ?`,
      [
        payload.nombre,
        payload.apellido,
        payload.resumen,
        payload.titulos,
        payload.experiencia_laboral,
        payload.url_imagen,
        now,
        localId,
      ],
    );

    // Si el registro nunca se subió, se actualiza el payload del 'create' pendiente...
    const createOp = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM sync_queue WHERE local_id = ? AND operation = 'create'",
      localId,
    );

    if (createOp) {
      await db.runAsync('UPDATE sync_queue SET payload = ? WHERE id = ?', [
        JSON.stringify(payload),
        createOp.id,
      ]);
      return;
    }

    // ...si ya hay un 'update' en cola, se reemplaza; si no, se encola uno nuevo
    const updateOp = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM sync_queue WHERE local_id = ? AND operation = 'update'",
      localId,
    );

    if (updateOp) {
      await db.runAsync('UPDATE sync_queue SET payload = ? WHERE id = ?', [
        JSON.stringify(payload),
        updateOp.id,
      ]);
      return;
    }

    await db.runAsync(
      `INSERT INTO sync_queue (operation, local_id, remote_id, payload, created_at)
       VALUES ('update', ?, ?, ?, ?)`,
      [localId, professor.id > 0 ? professor.id : null, JSON.stringify(payload), now],
    );
  });

  return {
    ...professor,
    nombre: payload.nombre,
    apellido: payload.apellido,
    name: `${payload.nombre} ${payload.apellido}`.trim(),
    specialty: payload.titulos || 'Docente',
    experience: payload.experiencia_laboral || 'Experiencia no disponible',
    bio: payload.resumen || 'No hay resumen disponible.',
    subjects: splitTitles(payload.titulos || 'Docencia'),
    imageUrl: payload.url_imagen,
    pending: true,
  };
}

// Elimina un profesor localmente y encola 'delete' (o descarta el 'create' si nunca subió)
export async function deleteProfessorLocal(professor: Professor): Promise<void> {
  const db = await getDatabase();
  const localId = await resolveLocalId(db, professor);
  if (localId == null) {
    return;
  }

  const remoteId = professor.id > 0 ? professor.id : null;
  const now = Date.now();

  await db.withTransactionAsync(async () => {
    // Quita las operaciones create/update pendientes de este registro
    await db.runAsync(
      "DELETE FROM sync_queue WHERE local_id = ? AND operation IN ('create', 'update')",
      localId,
    );

    // Borra la fila local (la UI ya no la muestra)
    await db.runAsync('DELETE FROM professors WHERE local_id = ?', localId);

    // Solo hay que avisar al servidor si el registro existía en la nube
    if (remoteId != null) {
      await db.runAsync(
        `INSERT INTO sync_queue (operation, local_id, remote_id, payload, created_at)
         VALUES ('delete', ?, ?, NULL, ?)`,
        [localId, remoteId, now],
      );
    }
  });
}

// ─── [SECCIÓN] Reconciliación con el servidor (las usa syncEngine) ───

// Aplica un registro del backend: actualiza si ya existe (salvo si tiene cambios
// locales pendientes, que ganan) o lo inserta como sincronizado.
// `markNew`: una inserción se marca con el badge "NUEVO" (solo tras la carga inicial
// de la caché, para no señalar todo el directorio en el primer arranque).
export async function upsertFromRemote(
  record: ProfessorRecord,
  options: { markNew?: boolean } = {},
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();

  const existing = await db.getFirstAsync<ProfessorRow>(
    'SELECT * FROM professors WHERE remote_id = ?',
    record.remote_id,
  );

  if (existing) {
    // "Última escritura gana": si el usuario lo editó localmente, no se pisa
    if (existing.sync_status === 'pending') {
      return;
    }

    // La actualización conserva el badge "NUEVO" si seguía pendiente de ver
    await db.runAsync(
      `UPDATE professors
         SET nombre = ?, apellido = ?, resumen = ?, titulos = ?, experiencia_laboral = ?, url_imagen = ?,
             sync_status = 'synced', updated_at = ?
       WHERE local_id = ?`,
      [
        record.nombre,
        record.apellido,
        record.resumen,
        record.titulos,
        record.experiencia_laboral,
        record.url_imagen,
        now,
        existing.local_id,
      ],
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO professors
      (remote_id, nombre, apellido, resumen, titulos, experiencia_laboral, url_imagen, sync_status, is_new, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)`,
    [
      record.remote_id,
      record.nombre,
      record.apellido,
      record.resumen,
      record.titulos,
      record.experiencia_laboral,
      record.url_imagen,
      options.markNew ? 1 : 0,
      now,
    ],
  );
}

// Borra los registros ya sincronizados que el servidor ya no devuelve (fueron
// eliminados en la nube). Reconciliación silenciosa; nunca toca los pendientes.
export async function deleteSyncedNotIn(remoteIds: number[]): Promise<void> {
  const db = await getDatabase();

  if (remoteIds.length === 0) {
    await db.runAsync("DELETE FROM professors WHERE sync_status = 'synced' AND remote_id IS NOT NULL");
    return;
  }

  const placeholders = remoteIds.map(() => '?').join(', ');
  await db.runAsync(
    `DELETE FROM professors
      WHERE sync_status = 'synced' AND remote_id IS NOT NULL AND remote_id NOT IN (${placeholders})`,
    remoteIds,
  );
}

// Marca un registro como sincronizado y le asigna su remote_id definitivo (tras un create)
export async function markSynced(localId: number, remoteId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE professors SET remote_id = ?, sync_status = 'synced' WHERE local_id = ?",
    [remoteId, localId],
  );
  // Las operaciones posteriores ya pueden resolver el remote_id desde la fila local
  await db.runAsync('UPDATE sync_queue SET remote_id = ? WHERE local_id = ? AND remote_id IS NULL', [
    remoteId,
    localId,
  ]);
}

// Descarta un profesor local y todas sus operaciones pendientes. Se usa cuando la
// nube responde 404: el registro se borró en línea y ese borrado gana sobre los
// cambios locales (así la cola no se queda atascada reintentando un recurso inexistente).
export async function discardLocalProfessor(localId: number): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM sync_queue WHERE local_id = ?', localId);
    await db.runAsync('DELETE FROM professors WHERE local_id = ?', localId);
  });
}

// Quita el badge "NUEVO" de un profesor (el usuario abrió su ficha)
export async function markProfessorSeen(professor: Professor): Promise<void> {
  const db = await getDatabase();
  const localId = await resolveLocalId(db, professor);
  if (localId == null) {
    return;
  }

  await db.runAsync('UPDATE professors SET is_new = 0 WHERE local_id = ?', localId);
}

// ─── [SECCIÓN] Cola de sincronización ───

export interface QueueItem {
  id: number;
  operation: SyncOperation;
  local_id: number;
  remote_id: number | null;
  payload: string | null;
  created_at: number;
}

// Devuelve la cola completa en orden de creación (FIFO)
export async function listQueue(): Promise<QueueItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<QueueItem>('SELECT * FROM sync_queue ORDER BY id ASC');
}

// Quita una operación de la cola (cuando ya se subió con éxito)
export async function removeQueueItem(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
}

// ─── [SECCIÓN] Metadatos (meta) ───

export async function getMetaValue(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string | null }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setMetaValue(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}
