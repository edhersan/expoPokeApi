// ──────────────────────────────────────────────────────────────
// ARCHIVO:  types/index.ts
// FUNCIÓN:  Tipos compartidos de toda la app (contratos de datos)
// USADO POR: services/*, context/*, components/* y pantallas
// CAMBIOS:  agregar un campo a una entidad → editar la interfaz correspondiente aquí
// ──────────────────────────────────────────────────────────────

// Pokémon: ficha que muestra la app en las pestañas "Pokédex" e "Info Pokémon"
// (la mapea services/pokemonApi.ts a partir de la respuesta de la API)
export interface Pokemon {
  id: number;
  name: string;
  // Altura en centímetros y peso en gramos (la UI los divide entre 10 para mostrar m / kg)
  height: number;
  weight: number;
  // Sprites/imagenes del Pokémon: frontal, shiny, dorso y arte oficial / dream world
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
      dream_world: {
        front_default: string | null;
      };
    };
  };
  // Lista de ataques; la app muestra los 2 primeros en la Pokédex y los 4 en Info Pokémon
  moves: Array<{
    move: {
      name: string;
    };
  }>;
  description: string;
}

// Videojuego: ficha que muestra la app en las pestañas "Juegos" e "Info Juego"
// (la mapea services/juegosApi.ts a partir de la API FreeToGame)
export interface Game {
  id: number;
  title: string;
  name: string;
  thumbnail: string;
  screenshots: Array<{ image: string }>;
  release_date: string;
  developer: string;
  description: string;
  short_description: string;
  // Lista de imágenes ya preparada (portada + capturas) que usa GameGallery
  images: string[];
  released: string;
}

// Profesor: ficha del directorio de docentes (pestaña "Profesor")
// la mapea services/profesoresApi.ts (mapProfessor) desde la API de docentes
export interface Professor {
  id: number;
  nombre: string;
  apellido: string;
  // Nombre completo "nombre apellido" (deriva de los dos campos anteriores)
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  // Títulos ya separados en una lista (los usa "ÁREAS DE ESTUDIO" en ProfessorDetail)
  subjects: string[];
  imageUrl: string;
  // true cuando el registro tiene cambios locales aún no subidos al servidor
  // (lo asigna services/professorsRepo.ts según la cola de sincronización)
  pending?: boolean;
  // true cuando el registro se insertó en la nube y aún no se ha abierto en este
  // dispositivo (indicador "NUEVO"; se limpia al consultar la ficha)
  isNew?: boolean;
}

// Mensaje del chat (pestaña "Chat"): burbuja del usuario o del asistente.
// `error` marca las respuestas que fallaron (la UI ofrece reintentar)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  error?: boolean;
}

// Respuesta de la API del chat (POST /chat): la mapea services/chatApi.ts
export interface ChatReply {
  reply: string;
  interactionId?: string;
}

// Operación de la cola de sincronización offline (services/professorsRepo.ts)
export type SyncOperation = 'create' | 'update' | 'delete';

// Proveedores de IA disponibles para el chat
export type AIProvider = 'gemini' | 'openai' | 'deepseek';

export const AI_PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
];

export const TIMEOUT_OPTIONS: { value: number; label: string }[] = [
  { value: 5000, label: '5 segundos' },
  { value: 10000, label: '10 segundos' },
  { value: 20000, label: '20 segundos' },
  { value: 40000, label: '40 segundos' },
];

// Errores de búsqueda que lanzan los servicios de Pokémon y juegos;
// los traduce a mensajes en español context/PokemonSearchContext.tsx y GameSearchContext.tsx
export interface ApiError extends Error {
  message: 'EMPTY_QUERY' | 'POKEMON_NOT_FOUND' | 'GAME_NOT_FOUND';
}
