// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/profesor/ProfessorDetail.tsx
// FUNCIÓN:  Ficha completa de un profesor (vista de detalle al tocar una tarjeta)
//           Muestra avatar, nombre, títulos, experiencia, biografía y áreas de estudio
// USADO POR: profesor.tsx (cuando selectedProfessor no es null)
// CAMBIOS:  tag "NUEVO" para inserciones de la nube | secciones de la ficha → JSX del return |
//           estilos → profesorStyles.ts
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import React from 'react';
import { Professor } from '@/types';
import { profesorStyles as styles } from './profesorStyles';

interface ProfessorDetailProps {
  professor: Professor;
  onBack: () => void;
}

export default function ProfessorDetail({ professor, onBack }: ProfessorDetailProps) {
  return (
    <View style={styles.detail}>
      {/* Botón de regreso al directorio */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Regresar al directorio de profesores"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={18} color="#275972" />
        <Text style={styles.backLabel}>REGRESAR</Text>
      </Pressable>

      {/* Hero: foto + nombre + especialidad */}
      <View style={styles.detailHero}>
        {professor.imageUrl ? (
          <Image source={{ uri: professor.imageUrl }} style={styles.detailAvatarImage} />
        ) : (
          <View style={styles.detailAvatar}>
            <Ionicons name="school" size={34} color="#275972" />
          </View>
        )}
        <Text style={styles.kicker}>PERFIL DEL PROFESOR</Text>
        <Text style={styles.detailName}>{professor.name}</Text>
        <Text style={styles.detailSpecialty}>{professor.specialty}</Text>
        {/* Inserto bajado de la nube en el último monitoreo */}
        {professor.isNew ? (
          <View style={styles.newTag}>
            <Ionicons name="sparkles" size={13} color="#1d7d52" />
            <Text style={styles.newTagText}>NUEVO EN EL DIRECTORIO</Text>
          </View>
        ) : null}
        {/* Aviso discreto: el registro se guardó local y aún no subió al servidor */}
        {professor.pending ? (
          <View style={styles.pendingTag}>
            <Ionicons name="cloud-offline-outline" size={13} color="#c0392b" />
            <Text style={styles.pendingTagText}>PENDIENTE DE SINCRONIZAR</Text>
          </View>
        ) : null}
      </View>

      {/* Tarjetas de metadatos: títulos y experiencia */}
      <View style={styles.metaRow}>
        <View style={styles.metaCard}>
          <Ionicons name="school-outline" size={18} color="#275972" />
          <Text style={styles.metaLabel}>TÍTULOS</Text>
          <Text style={styles.metaValue}>{professor.specialty}</Text>
        </View>
        <View style={styles.metaCard}>
          <Ionicons name="ribbon-outline" size={18} color="#275972" />
          <Text style={styles.metaLabel}>EXPERIENCIA</Text>
          <Text style={styles.metaValue}>{professor.experience}</Text>
        </View>
      </View>

      {/* Biografía completa */}
      <Text style={styles.sectionTitle}>SOBRE EL PROFESOR</Text>
      <View style={styles.descriptionBox}>
        <Text style={styles.description}>{professor.bio}</Text>
      </View>

      {/* Áreas de estudio: subjects viene ya separado en array desde mapProfessor */}
      <Text style={styles.sectionTitle}>ÁREAS DE ESTUDIO</Text>
      <View style={styles.subjects}>
        {professor.subjects.map((subject) => (
          <View key={subject} style={styles.subject}>
            <Text style={styles.subjectText}>{subject}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
