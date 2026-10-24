// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/chat/ChatComposer.tsx
// FUNCIÓN:  Barra de escritura del chat (input multilínea + botón de enviar)
// USADO POR: app/(tabs)/chat.tsx
// CAMBIOS:  placeholder → CHAT_PLACEHOLDER | colores → styles |
//           sombras del botón → getShadows() | máximo de alto → styles.input maxHeight
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import React from 'react';

// Props: el padre controla el texto (draft) y recibe el evento de enviar.
// `sending` desactiva el botón mientras el asistente responde (el input sigue editable)
interface ChatComposerProps {
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  value: string;
}

const PLACEHOLDER = 'Escribe tu mensaje…';

// Sombras del botón de enviar, adaptadas a cada plataforma (iOS / Android / Web)
function getShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#1d5068', shadowOpacity: 0.28, shadowRadius: 7, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 7px rgba(29, 80, 104, 0.28)' },
    default: {},
  }) || {};
}

export default function ChatComposer({ onChangeText, onSend, sending, value }: ChatComposerProps) {
  const sendButtonStyle = { ...styles.sendButton, ...getShadows() };
  const canSend = value.trim() !== '' && !sending;

  return (
    <View style={styles.composerRow}>
      {/* Campo de texto: Return envía (submitBehavior="submit") y admite varias líneas */}
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel="Escribe tu mensaje"
          autoCapitalize="sentences"
          multiline
          onChangeText={onChangeText}
          onSubmitEditing={() => {
            if (canSend) {
              onSend();
            }
          }}
          placeholder={PLACEHOLDER}
          placeholderTextColor="#6b8999"
          returnKeyType="send"
          style={styles.input}
          submitBehavior="submit"
          value={value}
        />
      </View>
      {/* Botón de enviar: mismo evento que pulsar Return en el teclado */}
      <Pressable
        accessibilityLabel="Enviar mensaje"
        accessibilityRole="button"
        disabled={!canSend}
        onPress={onSend}
        style={({ pressed }) => [sendButtonStyle, !canSend && styles.disabled, pressed && styles.pressed]}
      >
        <Ionicons name="send" size={20} color="#ffffff" />
      </Pressable>
    </View>
  );
}

// ─── [SECCIÓN] Estilos (mismos materiales que SearchBar) ───
const styles = StyleSheet.create({
  composerRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 10, paddingTop: 8 },
  inputWrap: { backgroundColor: 'rgba(255, 255, 255, 0.64)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, borderWidth: 1.5, flex: 1, justifyContent: 'center', minHeight: 52, paddingHorizontal: 14, paddingVertical: 4 },
  input: { color: '#123247', fontSize: 16, fontWeight: '600', maxHeight: 110, paddingVertical: 10 },
  sendButton: { alignItems: 'center', backgroundColor: '#276782', borderRadius: 12, height: 52, justifyContent: 'center', width: 55 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
});
