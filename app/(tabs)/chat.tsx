// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/(tabs)/chat.tsx
// FUNCIÓN:  Pantalla "Chat" → conversación con el asistente de la API.
//           Al abrir la pestaña muestra la bienvenida, las preguntas sugeridas
//           y el input listo; el historial vive en memoria durante la sesión.
// DEPENDE:  constants/chat.ts (CHAT_WELCOME, CHAT_SUGGESTIONS), services/chatApi.ts,
//           app/components/chat/* (ChatBubble, ChatComposer, ChatSuggestions, TypingBubble)
// USADO POR: pestaña 6 de la app (ver app/(tabs)/_layout.tsx)
// CAMBIOS:  textos del encabezado ("ASISTENTE / POKEDEX EXPO") → JSX | colores aero → styles |
//           bienvenida/sugerencias → constants/chat.ts | flujo de envío → sendText/requestReply
// NOTA:     La API es stateless: cada mensaje se envía solo (sin historial) y el asistente
//           únicamente responde temas de Pokémon, videojuegos y profesores.
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatComposer from '@/components/chat/ChatComposer';
import ChatSuggestions from '@/components/chat/ChatSuggestions';
import TypingBubble from '@/components/chat/TypingBubble';
import { CHAT_SUGGESTIONS, CHAT_WELCOME } from '@/constants/chat';
import { getChatErrorMessage, sendChatMessage } from '@/services/chatApi';
import { ChatMessage } from '@/types';

// Contador para generar ids únicos y estables de cada burbuja
let messageCounter = 0;
function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

// Sombras del círculo decorativo del encabezado, por plataforma (iOS/Android/Web)
function getHeaderMarkShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#39738e', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 8px rgba(57, 115, 142, 0.2)' },
    default: {},
  }) || {};
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  // Estado de la conversación (en memoria): arranca con la bienvenida del asistente
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', text: CHAT_WELCOME },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const headerMarkStyle = { ...styles.headerMark, ...getHeaderMarkShadows() };

  // Mantiene la vista pegada al último mensaje cada vez que crece el contenido
  function scrollToEnd() {
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  // Pide la respuesta del asistente para un texto ya validado y la agrega al final.
  // Si la API falla, agrega una burbuja de error con la opción de reintentar
  async function requestReply(text: string) {
    setSending(true);
    try {
      const reply = await sendChatMessage(text);
      setMessages((prev) => [...prev, { id: createMessageId(), role: 'assistant', text: reply }]);
    } catch (error) {
      console.warn('[ChatScreen] Reply failed:', error);
      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: 'assistant', text: getChatErrorMessage(error), error: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  // Envía un texto nuevo: lo agrega como burbuja del usuario y pide la respuesta.
  // Sirve tanto para el input como para las preguntas sugeridas
  function sendText(text: string) {
    const clean = text.trim();
    if (!clean || sending) {
      return;
    }
    setMessages((prev) => [...prev, { id: createMessageId(), role: 'user', text: clean }]);
    setDraft('');
    void requestReply(clean);
  }

  // Reintento de una respuesta fallida: quita la burbuja de error y repite el último mensaje
  function handleRetry() {
    if (sending) {
      return;
    }
    const lastUser = [...messages].reverse().find((message) => message.role === 'user');
    if (!lastUser) {
      return;
    }
    setMessages((prev) => (prev[prev.length - 1]?.error ? prev.slice(0, -1) : prev));
    void requestReply(lastUser.text);
  }

  // Las sugerencias solo se ofrecen antes del primer mensaje del usuario
  const showSuggestions = !sending && !messages.some((message) => message.role === 'user');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      {/* Fondo decorativo "aero": brillos circulares + línea de luz superior */}
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.aeroGlow, styles.glowTop]} />
        <View style={[styles.aeroGlow, styles.glowBottom]} />
        <View style={styles.aeroHighlight} />
      </View>

      {/* ─── [SECCIÓN] Encabezado (etiqueta + título + círculo con burbujas) ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ASISTENTE / POKEDEX EXPO</Text>
          <Text style={styles.title}>¿en qué te ayudo?</Text>
        </View>
        <View style={headerMarkStyle}>
          <Ionicons name="chatbubbles" size={19} color="#275972" />
        </View>
      </View>

      {/* Conversación: burbujas + sugerencias iniciales + "escribiendo…" */}
      <ScrollView
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={styles.messages}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onRetry={message.error ? handleRetry : undefined} />
        ))}
        {showSuggestions && <ChatSuggestions onSelect={sendText} suggestions={CHAT_SUGGESTIONS} />}
        {sending && <TypingBubble />}
      </ScrollView>

      {/* Barra de escritura: envía con el botón o con Return del teclado */}
      <ChatComposer onChangeText={setDraft} onSend={() => sendText(draft)} sending={sending} value={draft} />
    </KeyboardAvoidingView>
  );
}

// ─── [SECCIÓN] Estilos ───
// Paleta aero: fondo #d9edf8 | texto #123247 | acentos #35627a / #275972
const styles = StyleSheet.create({
  screen: { backgroundColor: '#d9edf8', flex: 1, overflow: 'hidden', paddingHorizontal: 20 },
  backgroundLayer: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  aeroGlow: { borderRadius: 180, position: 'absolute' },
  glowTop: { backgroundColor: 'rgba(255, 255, 255, 0.62)', height: 270, right: -95, top: -95, width: 270 },
  glowBottom: { backgroundColor: 'rgba(99, 181, 225, 0.32)', bottom: -125, height: 300, left: -120, width: 300 },
  aeroHighlight: { backgroundColor: 'rgba(255, 255, 255, 0.32)', height: 1, left: 0, position: 'absolute', right: 0, top: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14, paddingTop: 14 },
  eyebrow: { color: '#35627a', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#123247', fontSize: 27, fontWeight: '900', letterSpacing: 0 },
  headerMark: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.36)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, borderWidth: 1.5, height: 38, justifyContent: 'center', width: 38 },
  messages: { flex: 1 },
  messagesContent: { paddingBottom: 8 },
});
