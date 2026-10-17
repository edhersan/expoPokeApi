// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/db.web.ts
// FUNCIÓN:  Versión web de services/db.ts (Metro elige este archivo al compilar
//           para web). En el navegador no existe SQLite: la app funciona en modo
//           online clásico y este módulo nunca abre una base de datos (así el
//           bundle web no intenta cargar wa-sqlite/wasm).
// DEPENDE:  nada (solo aplica en navegador)
// USADO POR: services/professorsRepo.ts, services/pokemonRepo.ts, services/syncEngine.ts
//            (en la resolución de módulos de web)
// ──────────────────────────────────────────────────────────────

// Nombre del archivo de base de datos (no aplica en web; se mantiene por contrato)
export const DATABASE_NAME = 'pokedex.db';

// ¿La plataforma actual soporta la BD offline? En web nunca (comportamiento online)
export const isDatabaseSupported = false;

// Mismo contrato que services/db.ts; en web nadie debe llamarla porque
// isDatabaseSupported es false en todos los módulos que la usan
export async function getDatabase(): Promise<never> {
  throw new Error('DB_NOT_SUPPORTED');
}
