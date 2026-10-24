// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/chat/ChatBubble.tsx
// FUNCIÓN:  Burbuja de mensaje del chat (usuario a la derecha, asistente a la izquierda)
// USADO POR: app/(tabs)/chat.tsx
// CAMBIOS:  colores → styles | sombras → getBubbleShadows() | acción de reintento → onRetry
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ChatMessage } from '@/types';

// Props: mensaje a pintar y, si es una respuesta fallida, acción para reintentar
interface ChatBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

// Sombras de las burbujas, adaptadas a cada plataforma (iOS / Android / Web)
function getBubbleShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#39738e', shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 2 },
    web: { boxShadow: '0 2px 6px rgba(57, 115, 142, 0.16)' },
    default: {},
  }) || {};
}

export default function ChatBubble({ message, onRetry }: ChatBubbleProps) {
  const bubbleShadows = getBubbleShadows();

  // ─── [SECCIÓN] Burbuja del usuario (derecha, fondo azul) ───
  if (message.role === 'user') {
    return (
      <View style={styles.rowUser}>
        <View style={[styles.bubbleUser, bubbleShadows]}>
          <Text style={styles.textUser}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // ─── [SECCIÓN] Burbuja del asistente (izquierda, vidrio claro) ───
  // Si `message.error` está activo se pinta en tono de aviso y ofrece reintentar
  const isError = message.error === true;

  return (
    <View style={styles.rowAssistant}>
      <View style={[styles.bubbleAssistant, bubbleShadows, isError && styles.bubbleError]}>
        <View style={styles.assistantHeader}>
          <Ionicons name={isError ? 'cloud-offline-outline' : 'sparkles'} size={14} color={isError ? '#d86a5d' : '#275972'} />
          <Text style={[styles.assistantName, isError && styles.assistantNameError]}>
            {isError ? 'Sin conexión' : 'Asistente'}
          </Text>
        </View>
        <Text style={[styles.textAssistant, isError && styles.textError]}>{message.text}</Text>
        {isError && onRetry && (
          <Pressable
            accessibilityLabel="Reintentar mensaje"
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Ionicons name="refresh" size={14} color="#ffffff" />
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── [SECCIÓN] Estilos ───
// Paleta aero: texto #123247 | azul usuario #276782 | error #d86a5d / #8d3329
const styles = StyleSheet.create({
  rowUser: { alignItems: 'flex-end', marginBottom: 10 },
  rowAssistant: { alignItems: 'flex-start', marginBottom: 10 },
  bubbleUser: { backgroundColor: '#276782', borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAssistant: { backgroundColor: 'rgba(255, 255, 255, 0.64)', borderBottomLeftRadius: 4, borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, borderWidth: 1.5, maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10 },
  bubbleError: { backgroundColor: 'rgba(255, 235, 232, 0.86)', borderColor: '#d86a5d' },
  assistantHeader: { alignItems: 'center', flexDirection: 'row', gap: 5, marginBottom: 4 },
  assistantName: { color: '#35627a', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  assistantNameError: { color: '#d86a5d' },
  textUser: { color: '#ffffff', fontSize: 15, fontWeight: '600', lineHeight: 21 },
  textAssistant: { color: '#123247', fontSize: 15, fontWeight: '600', lineHeight: 21 },
  textError: { color: '#8d3329' },
  retryButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#d86a5d', borderRadius: 10, flexDirection: 'row', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 7 },
  retryText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
