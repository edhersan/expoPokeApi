// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/chat/ChatSuggestions.tsx
// FUNCIÓN:  Chips de preguntas sugeridas que inician la conversación con un toque
// USADO POR: app/(tabs)/chat.tsx (solo antes del primer mensaje del usuario)
// CAMBIOS:  preguntas → constants/chat.ts (CHAT_SUGGESTIONS) | colores → styles
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';

// Props: lista de preguntas y acción a ejecutar al tocar una (enviarla al chat)
interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
  suggestions: string[];
}

export default function ChatSuggestions({ onSelect, suggestions }: ChatSuggestionsProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>PUEDES PREGUNTARME</Text>
      <View style={styles.chips}>
        {suggestions.map((suggestion) => (
          <Pressable
            accessibilityLabel={suggestion}
            accessibilityRole="button"
            key={suggestion}
            onPress={() => onSelect(suggestion)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#275972" />
            <Text style={styles.chipText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── [SECCIÓN] Estilos ───
const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', marginTop: 2 },
  hint: { color: '#35627a', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  chips: { alignItems: 'flex-start', gap: 8 },
  chip: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.64)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', gap: 8, paddingHorizontal: 13, paddingVertical: 9 },
  chipText: { color: '#123247', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
