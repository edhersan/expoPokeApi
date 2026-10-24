// ──────────────────────────────────────────────────────────────
// ARCHIVO:  constants/chat.ts
// FUNCIÓN:  Configuración de la API del chat (asistente Pokedex Expo)
// USADO POR: services/chatApi.ts, app/(tabs)/chat.tsx
// CAMBIOS:  URL del servidor → CHAT_API_URL | bienvenida → CHAT_WELCOME |
//           preguntas sugeridas → CHAT_SUGGESTIONS
// ──────────────────────────────────────────────────────────────

// URL base de la API del chat (backend propio desplegado en Vercel)
export const CHAT_API_URL = 'https://api-chat-blush.vercel.app';

// Timeout de la petición al chat en milisegundos (valor por defecto)
export const DEFAULT_CHAT_TIMEOUT_MS = 45000;

// Mensaje de bienvenida local: se muestra al abrir la pestaña, antes de la primera pregunta
export const CHAT_WELCOME =
  '¡Hola! Soy el asistente de Pokedex Expo. Puedo ayudarte con temas de Pokémon, videojuegos y profesores. ¿Sobre cuál quieres preguntar?';

// Preguntas sugeridas que se ofrecen como chips cuando la conversación está vacía
export const CHAT_SUGGESTIONS = [
  '¿Qué Pokémon me recomiendas?',
  '¿Qué videojuegos puedo buscar?',
  '¿Quiénes son los profesores?',
];
