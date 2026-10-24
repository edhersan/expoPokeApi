// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/chat/TypingBubble.tsx
// FUNCIÓN:  Burbuja del asistente en estado "escribiendo…" mientras llega la respuesta
// USADO POR: app/(tabs)/chat.tsx (se muestra mientras se espera a la API)
// CAMBIOS:  colores/spinner → styles
// ──────────────────────────────────────────────────────────────

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React from 'react';

export default function TypingBubble() {
  return (
    <View style={styles.rowAssistant}>
      <View style={styles.bubbleAssistant}>
        <ActivityIndicator color="#275972" size="small" />
        <Text style={styles.text}>Escribiendo…</Text>
      </View>
    </View>
  );
}

// ─── [SECCIÓN] Estilos (mismo vidrio claro que las burbujas del asistente) ───
const styles = StyleSheet.create({
  rowAssistant: { alignItems: 'flex-start', marginBottom: 10 },
  bubbleAssistant: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.64)', borderBottomLeftRadius: 4, borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, borderWidth: 1.5, flexDirection: 'row', gap: 9, paddingHorizontal: 14, paddingVertical: 12 },
  text: { color: '#35627a', fontSize: 13, fontWeight: '700' },
});
