// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/profesor/StatusMessage.tsx
// FUNCIÓN:  Mensaje de texto centrado para estados de carga y vacío
// USADO POR: ProfessorDirectory ("Cargando profesores...", "No hay profesores disponibles.")
// CAMBIOS:  estilo del texto → styles.status / styles.statusText en profesorStyles.ts
// ──────────────────────────────────────────────────────────────

import { Text, View } from 'react-native';
import React from 'react';
import { profesorStyles as styles } from './profesorStyles';

export default function StatusMessage({ message }: { message: string }) {
  return (
    <View style={styles.status}>
      <Text style={styles.statusText}>{message}</Text>
    </View>
  );
}
