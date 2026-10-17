// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/pokemonRepo.ts
// FUNCIÓN:  Repositorio local del catálogo de Pokémon (capa offline-first de solo lectura).
//           Las fichas se cachean en SQLite al buscarlas y el motor de sincronización
//           reconcilia el catálogo completo cuando hay red.
// DEPENDE:  services/db.ts, types/index.ts (Pokemon)
// USADO POR: services/syncEngine.ts, context/PokemonSearchContext.tsx
// CAMBIOS:  columnas → PokemonRow | búsqueda local → findPokemonLocal
// ──────────────────────────────────────────────────────────────

import { getDatabase } from '@/services/db';
import { Pokemon } from '@/types';

// Fila de la tabla `pokemon` (nombres de columna en la BD)
export interface PokemonRow {
  id: number;
  name: string;
  payload: string;
  updated_at: number;
}

// ─── [SECCIÓN] Lecturas (siempre desde SQLite) ───

// Ficha completa cacheada de un Pokémon (o null si no está guardado)
export async function getPokemonLocal(id: number): Promise<Pokemon | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PokemonRow>('SELECT * FROM pokemon WHERE id = ?', id);
  return row ? (JSON.parse(row.payload) as Pokemon) : null;
}

// Payload crudo cacheado (para comparar con la versión de la nube sin parsear)
export async function getPokemonPayloadLocal(id: number): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Pick<PokemonRow, 'payload'>>(
    'SELECT payload FROM pokemon WHERE id = ?',
    id,
  );
  return row?.payload ?? null;
}

// Lista completa del catálogo cacheado (para inspección y conteos)
export async function listPokemonLocal(): Promise<Pokemon[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PokemonRow>('SELECT * FROM pokemon ORDER BY id ASC');
  return rows.map((row) => JSON.parse(row.payload) as Pokemon);
}

// Busca localmente por ID (si la búsqueda es numérica) o por nombre:
// primero exacto y, como último recurso offline, coincidencia parcial
export async function findPokemonLocal(query: string): Promise<Pokemon | null> {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return null;
  }

  const db = await getDatabase();

  // ¿La búsqueda es un id numérico?
  const numericId = Number(clean);
  if (Number.isInteger(numericId) && numericId > 0) {
    const byId = await db.getFirstAsync<PokemonRow>('SELECT * FROM pokemon WHERE id = ?', numericId);
    if (byId) {
      return JSON.parse(byId.payload) as Pokemon;
    }
  }

  // Nombre exacto (sin distinguir mayúsculas)
  const exact = await db.getFirstAsync<PokemonRow>(
    'SELECT * FROM pokemon WHERE lower(name) = ? LIMIT 1',
    clean,
  );
  if (exact) {
    return JSON.parse(exact.payload) as Pokemon;
  }

  // Coincidencia parcial (el nombre más corto gana: "pika" → "pikachu")
  const partial = await db.getFirstAsync<PokemonRow>(
    'SELECT * FROM pokemon WHERE lower(name) LIKE ? ORDER BY length(name) ASC LIMIT 1',
    `%${clean}%`,
  );
  return partial ? (JSON.parse(partial.payload) as Pokemon) : null;
}

// ─── [SECCIÓN] Escrituras locales (las usa el motor de sincronización) ───

// Guarda o actualiza la ficha cacheada de un Pokémon
export async function upsertPokemonLocal(pokemon: Pokemon): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO pokemon (id, name, payload, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       payload = excluded.payload,
       updated_at = excluded.updated_at`,
    [pokemon.id, pokemon.name, JSON.stringify(pokemon), Date.now()],
  );
}

// Borra del catálogo local los Pokémon que la nube ya no devuelve (fueron eliminados)
export async function deletePokemonNotIn(remoteIds: number[]): Promise<void> {
  const db = await getDatabase();

  if (remoteIds.length === 0) {
    await db.runAsync('DELETE FROM pokemon');
    return;
  }

  const placeholders = remoteIds.map(() => '?').join(', ');
  await db.runAsync(`DELETE FROM pokemon WHERE id NOT IN (${placeholders})`, remoteIds);
}
