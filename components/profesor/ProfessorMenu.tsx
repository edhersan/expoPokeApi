// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/profesor/ProfessorMenu.tsx
// FUNCIÓN:  Menú contextual (popover) del botón "⋮": acciones Editar y Borrar
// USADO POR: profesor.tsx (se ancla a la posición del botón kebab que lo abrió)
// CAMBIOS:  acciones del menú → bloques <Pressable> del popover |
//           posición/estilo → styles.popover en profesorStyles.ts
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import React from 'react';
import { Professor } from '@/types';
import { MenuAnchor } from './profesorTypes';
import { profesorStyles as styles } from './profesorStyles';

interface ProfessorMenuProps {
  // null = menú cerrado; con valor = profesor seleccionado + posición del botón ⋮
  menu: { professor: Professor; anchor: MenuAnchor } | null;
  windowWidth: number;
  onEdit: (professor: Professor) => void;
  onDelete: (professor: Professor) => void;
  onClose: () => void;
}

export default function ProfessorMenu({ menu, windowWidth, onEdit, onDelete, onClose }: ProfessorMenuProps) {
  return (
    <Modal
      visible={menu !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Tocar fuera del menú lo cierra */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            styles.popover,
            {
              // Se posiciona relativo al botón ⋮ que lo abrió (anchor)
              right: menu ? windowWidth - (menu.anchor.x + menu.anchor.width) : 16,
              top: menu ? menu.anchor.y + menu.anchor.height + 8 : 64,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar profesor"
            onPress={() => menu && onEdit(menu.professor)}
            style={({ pressed }) => [styles.popoverItem, pressed && styles.popoverItemPressed]}
          >
            <Ionicons name="create-outline" size={18} color="#275972" />
            <Text style={styles.popoverItemText}>Editar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Borrar profesor"
            onPress={() => menu && onDelete(menu.professor)}
            style={({ pressed }) => [styles.popoverItem, pressed && styles.popoverItemPressed]}
          >
            <Ionicons name="trash-outline" size={18} color="#c0392b" />
            <Text style={[styles.popoverItemText, styles.popoverItemDanger]}>Borrar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
