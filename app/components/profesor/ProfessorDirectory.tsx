// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/profesor/ProfessorDirectory.tsx
// FUNCIÓN:  Directorio de profesores: contador, tarjeta "Agregar", lista de tarjetas
//           y estados de carga / error / vacío
// USADO POR: profesor.tsx (se muestra cuando no hay profesor seleccionado)
// CAMBIOS:  tarjeta del profesor → <Pressable> de styles.professorCard |
//           estados → StatusMessage / bloque de error | menú ⋮ → KebabButton (interno)
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import React, { useRef } from 'react';
import { Professor } from '@/types';
import { MenuAnchor } from './profesorTypes';
import { profesorStyles as styles } from './profesorStyles';
import StatusMessage from './StatusMessage';

interface ProfessorDirectoryProps {
  professors: Professor[];
  loading: boolean;
  error: string | null;
  onSelect: (professor: Professor) => void;
  onOpenCreate: () => void;
  onOpenMenu: (professor: Professor, anchor: MenuAnchor) => void;
  onRetry: () => void;
}

export default function ProfessorDirectory({
  professors,
  loading,
  error,
  onSelect,
  onOpenCreate,
  onOpenMenu,
  onRetry,
}: ProfessorDirectoryProps) {
  // ── Estados previos al directorio ──
  if (loading) {
    return <StatusMessage message="Cargando profesores..." />;
  }

  if (error) {
    return (
      <View style={styles.status}>
        <Text style={styles.statusText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>REINTENTAR</Text>
        </Pressable>
      </View>
    );
  }

  // ── Directorio ──
  return (
    <View>
      {/* Contador de expertos + tarjeta especial para crear */}
      <View style={styles.sectionHeader}>
        <Text style={styles.kicker}>DIRECTORIO DE PROFESORES</Text>
        <Text style={styles.count}>{professors.length} EXPERTOS</Text>
      </View>

      {/* Tarjeta "Agregar docente" (borde punteado) → abre modal en modo crear */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar docente"
        onPress={onOpenCreate}
        style={({ pressed }) => [styles.professorCard, styles.addCard, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          <Ionicons name="person-add-outline" size={25} color="#275972" />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardCopy}>
            <Text style={styles.professorName}>Agregar docente</Text>
            <Text style={styles.cardResumen} numberOfLines={2}>
              Crea una nueva ficha en el directorio
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b8999" />
      </Pressable>

      {/* Lista de profesores: tocar la tarjeta abre el detalle; el menú ⋮ da editar/borrar */}
      <View style={styles.list}>
        {professors.map((professor) => (
          <View key={professor.id} style={styles.professorCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver más sobre ${professor.name}`}
              onPress={() => onSelect(professor)}
              style={({ pressed }) => [styles.cardBody, pressed && styles.pressed]}
            >
              {professor.imageUrl ? (
                <Image source={{ uri: professor.imageUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="school-outline" size={25} color="#275972" />
                </View>
              )}
              <View style={styles.cardCopy}>
                <Text style={styles.cardId}>#{professor.id}</Text>
                <Text style={styles.professorName}>{professor.name}</Text>
                <Text style={styles.cardResumen} numberOfLines={3}>
                  {professor.bio}
                </Text>
              </View>
            </Pressable>
            {/* KebabButton mide su posición y notifica al padre para anclar el popup */}
            <KebabButton onOpen={(anchor) => onOpenMenu(professor, anchor)} />
            <Ionicons name="chevron-forward" size={20} color="#6b8999" />
          </View>
        ))}
      </View>

      {professors.length === 0 ? <StatusMessage message="No hay profesores disponibles." /> : null}
    </View>
  );
}

// Botón "⋮" (kebab): mide su posición en pantalla y la pasa al padre para anclar el menú
function KebabButton({ onOpen }: { onOpen: (anchor: MenuAnchor) => void }) {
  const buttonRef = useRef<View>(null);

  return (
    <Pressable
      ref={buttonRef}
      accessibilityRole="button"
      accessibilityLabel="Más opciones"
      hitSlop={8}
      onPress={() => {
        // measureInWindow da coordenadas absolutas del botón en la ventana
        buttonRef.current?.measureInWindow((x, y, width, height) => {
          onOpen({ x, y, width, height });
        });
      }}
      style={({ pressed }) => [styles.kebabButton, pressed && styles.pressed]}
    >
      <Ionicons name="ellipsis-vertical" size={18} color="#275972" />
    </Pressable>
  );
}
