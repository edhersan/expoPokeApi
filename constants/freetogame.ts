// ──────────────────────────────────────────────────────────────
// ARCHIVO:  constants/freetogame.ts
// FUNCIÓN:  Configuración de la API de videojuegos (FreeToGame)
// USADO POR: services/juegosApi.ts, context/GameSearchContext.tsx
// CAMBIOS:  URL del servidor → FREETOGAME_API_URL | juego inicial → INITIAL_GAME
// ──────────────────────────────────────────────────────────────

// URL base de la API de videojuegos (backend propio desplegado en Vercel)
export const FREETOGAME_API_URL = 'https://games-api-iota.vercel.app';

// Nombre del videojuego que se carga automáticamente al abrir la pestaña de juegos
export const INITIAL_GAME = 'Path of Exile';
