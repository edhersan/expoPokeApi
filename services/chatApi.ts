// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/chatApi.ts
// FUNCIÓN:  Conexión con la API del chat (asistente de Pokedex Expo)
// DEPENDE:  constants/chat.ts (CHAT_API_URL, DEFAULT_CHAT_TIMEOUT_MS), types/index.ts (ChatReply, AIProvider)
// USADO POR: app/(tabs)/chat.tsx → envía cada mensaje del usuario
// CAMBIOS:  URL/timeout → constants/chat.ts | mensajes de error →
//           getChatErrorMessage | código de error nuevo → lanzarlo en sendChatMessage
// NOTA:     La API es stateless: cada mensaje viaja solo (sin historial) y el
//           asistente únicamente responde temas de Pokémon, videojuegos y profesores.
// ──────────────────────────────────────────────────────────────

import { CHAT_API_URL, DEFAULT_CHAT_TIMEOUT_MS } from '@/constants/chat';
import { ChatReply, AIProvider } from '@/types';

// Envía un mensaje al asistente (POST /chat) y devuelve su respuesta en texto plano.
// Lanza: 'EMPTY_MESSAGE' si el texto está vacío | 'CHAT_UNAVAILABLE' si hay fallo
// de red, timeout o error del servidor | 'CHAT_BAD_RESPONSE' si la respuesta no trae `reply`
export async function sendChatMessage(
  message: string,
  options?: { timeoutMs?: number; provider?: AIProvider }
): Promise<string> {
  const clean = message.trim();
  if (!clean) {
    throw new Error('EMPTY_MESSAGE');
  }

  // Espera de 5 segundos para dar tiempo a que las demás APIs traigan sus datos
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 5000);
  });

  const url = `${CHAT_API_URL}/chat`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_CHAT_TIMEOUT_MS;
  const provider = options?.provider ?? 'gemini';
  console.log('[ChatAPI] Sending message', { timeoutMs, provider });

  // Timeout propio: si el modelo tarda demasiado se aborta la petición
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: clean, provider }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ChatAPI] Error response:', errorText);
      throw new Error('CHAT_UNAVAILABLE');
    }

    const data = (await response.json()) as ChatReply;
    const reply = (data.reply || '').trim();

    if (!reply) {
      throw new Error('CHAT_BAD_RESPONSE');
    }

    console.log('[ChatAPI] Reply received');
    return reply;
  } catch (error) {
    // Los errores de contrato se propagan tal cual; el resto es fallo de conexión
    if (error instanceof Error && error.message === 'CHAT_BAD_RESPONSE') {
      throw error;
    }
    console.warn('[ChatAPI] Fetch failed:', error);
    throw new Error('CHAT_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
  }
}

// Traduce los errores del chat a mensajes amigables en español para la pantalla
export function getChatErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message === 'EMPTY_MESSAGE') {
    return 'Escribe un mensaje para enviar.';
  }
  if (message === 'CHAT_BAD_RESPONSE') {
    return 'El asistente respondió de forma inesperada. Inténtalo de nuevo.';
  }
  return 'No pudimos conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.';
}
