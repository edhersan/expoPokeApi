// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/db.ts
// FUNCIÓN:  Abre la base de datos SQLite local y aplica las migraciones del esquema
// DEPENDE:  expo-sqlite
// USADO POR: services/professorsRepo.ts, services/pokemonRepo.ts, services/syncEngine.ts
// CAMBIOS:  columnas nuevas → CREATE TABLE / migraciones | nombre de la BD → DATABASE_NAME
// NOTA:     En web no se usa SQLite (falta configurar wa-sqlite/wasm); la app cae al
//           comportamiento online normal (ver context/ProfessorsContext.tsx)
// ──────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Nombre del archivo de base de datos local
export const DATABASE_NAME = 'pokedex.db';

// ¿La plataforma actual soporta la BD offline? (solo nativo Android/iOS)
export const isDatabaseSupported = Platform.OS !== 'web';

// Promesa única de la conexión: evita abrir la BD más de una vez (patrón singleton)
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Crea las tablas e índices si no existen (idempotente; seguro de ejecutar en cada arranque)
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // ─── [TABLA] professors: caché local del directorio + cambios pendientes ───
  // local_id: id interno (siempre presente) | remote_id: id real del backend (NULL si no sincronizó)
  // is_new: 1 = insertado en la nube y aún no visto en el dispositivo (badge "NUEVO")
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS professors (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_id INTEGER UNIQUE,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      resumen TEXT NOT NULL,
      titulos TEXT NOT NULL DEFAULT '',
      experiencia_laboral TEXT NOT NULL DEFAULT '',
      url_imagen TEXT NOT NULL DEFAULT '',
      sync_status TEXT NOT NULL DEFAULT 'synced',
      is_new INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);

  // ─── [MIGRACIÓN] columnas añadidas después de la primera versión del esquema ───
  // (SQLite no tiene "ADD COLUMN IF NOT EXISTS": se consulta el esquema antes)
  const professorColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(professors);');
  if (!professorColumns.some((column) => column.name === 'is_new')) {
    await db.execAsync("ALTER TABLE professors ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0;");
  }

  // ─── [TABLA] pokemon: caché local del catálogo (solo lectura, la nube es la fuente) ───
  // payload: ficha completa en JSON (tipo Pokemon) | name: columna buscable
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pokemon (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // ─── [TABLA] sync_queue: operaciones locales pendientes de subir al servidor ───
  // operation: 'create' | 'update' | 'delete' | payload: JSON (solo create/update)
  // remote_id: id del backend (necesario para update/delete aunque la fila local ya se borró)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      local_id INTEGER NOT NULL,
      remote_id INTEGER,
      payload TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // ─── [TABLA] meta: pares clave/valor (versión de esquema, última sincronización) ───
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// Devuelve la conexión abierta (y migrada); la crea la primera vez que se llama
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!isDatabaseSupported) {
    throw new Error('DB_NOT_SUPPORTED');
  }

  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await migrate(db);
      return db;
    })();
  }

  return databasePromise;
}
