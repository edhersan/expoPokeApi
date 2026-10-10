// ──────────────────────────────────────────────────────────────
// ARCHIVO:  constants/pokemon.ts
// FUNCIÓN:  Configuración de la API de Pokémon
// USADO POR: services/pokemonApi.ts, context/PokemonSearchContext.tsx
// CAMBIOS:  URL del servidor → API_URL | Pokémon inicial de la app → INITIAL_POKEMON
// ──────────────────────────────────────────────────────────────

// URL base de la API de Pokémon (backend propio desplegado en Vercel)
export const API_URL = 'https://pokemon-api-edhersan.vercel.app';

// Nombre o ID del Pokémon que se carga automáticamente al abrir la app
export const INITIAL_POKEMON = 'pikachu';
