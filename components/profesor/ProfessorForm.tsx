// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/profesor/ProfessorForm.tsx
// FUNCIÓN:  Modal de formulario para crear o editar un profesor (6 campos + acciones)
// USADO POR: profesor.tsx (lo abre openCreate / openEdit, lo envía submitForm)
// CAMBIOS:  campos del formulario → bloques <FormField> + FormValues en profesorTypes.ts |
//           textos/placeholder → JSX de cada <FormField> | botones → styles.formActions
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { FormMode, FormValues } from './profesorTypes';
import { profesorStyles as styles } from './profesorStyles';

interface ProfessorFormProps {
  visible: boolean;
  mode: FormMode;
  form: FormValues;
  formError: string | null;
  saving: boolean;
  onChangeField: (field: keyof FormValues, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function ProfessorForm({
  visible,
  mode,
  form,
  formError,
  saving,
  onChangeField,
  onSubmit,
  onClose,
}: ProfessorFormProps) {
  const insets = useSafeAreaInsets();

  return (
    // Se desliza desde abajo; no se puede cerrar mientras saving está activo
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (!saving) onClose();
      }}
    >
      <KeyboardAvoidingView
        style={styles.formScreen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Título según modo + botón de cerrar (X) */}
        <View style={[styles.formHeader, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.formTitle}>{mode === 'create' ? 'AGREGAR DOCENTE' : 'EDITAR DOCENTE'}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar formulario"
            onPress={onClose}
            disabled={saving}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={22} color="#275972" />
          </Pressable>
        </View>

        {/* Campos del formulario: cada uno corresponde a un campo de FormValues */}
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <FormField
            label="NOMBRE"
            value={form.nombre}
            onChangeText={(value) => onChangeField('nombre', value)}
            placeholder="Elfar Didier"
          />
          <FormField
            label="APELLIDO"
            value={form.apellido}
            onChangeText={(value) => onChangeField('apellido', value)}
            placeholder="Morantes Sánchez"
          />
          <FormField
            label="RESUMEN"
            value={form.resumen}
            onChangeText={(value) => onChangeField('resumen', value)}
            placeholder="Ingeniero Electrónico | Profesor Universitario | ..."
            multiline
          />
          <FormField
            label="TÍTULOS"
            value={form.titulos}
            onChangeText={(value) => onChangeField('titulos', value)}
            placeholder="Maestría en Elearning, Especialista en ..."
            multiline
          />
          <FormField
            label="EXPERIENCIA LABORAL"
            value={form.experiencia_laboral}
            onChangeText={(value) => onChangeField('experiencia_laboral', value)}
            placeholder="Profesor de ... en ..."
            multiline
          />
          <FormField
            label="URL DE IMAGEN"
            value={form.url_imagen}
            onChangeText={(value) => onChangeField('url_imagen', value)}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        </ScrollView>

        {/* Acciones: Cancelar cierra | Guardar llama a onSubmit (crear o editar) */}
        <View style={[styles.formActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            disabled={saving}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelLabel}>CANCELAR</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onSubmit}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              saving && styles.saveButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.saveLabel}>{saving ? 'GUARDANDO…' : 'GUARDAR'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Campo de texto reutilizable del formulario (con etiqueta y modo multilinea opcional)
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8fb0c2"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}
