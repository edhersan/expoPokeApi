// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/(tabs)/profesor.tsx
// FUNCIÓN:  Pantalla "Profesor" → orquestador del módulo: guarda el estado del
//           directorio y del formulario, ejecuta el CRUD y compone las piezas
// DEPENDE:  services/profesoresApi.ts (CRUD), components/profesor/* (UI)
// USADO POR: pestaña 5 de la app (ver app/(tabs)/_layout.tsx)
// CAMBIOS:  lógica de CRUD → loadProfessors / submitForm / confirmDelete |
//           composición de la vista → JSX del return | campos del formulario →
//           app/components/profesor/ProfessorForm.tsx + profesorTypes.ts
// ESTRUCTURA DEL MÓDULO:
//           app/components/profesor/profesorTypes.ts       (tipos y helpers)
//           app/components/profesor/profesorStyles.ts      (estilos compartidos)
//           app/components/profesor/ProfessorDirectory.tsx (lista + tarjeta agregar)
//           app/components/profesor/ProfessorDetail.tsx    (ficha de detalle)
//           app/components/profesor/ProfessorForm.tsx      (modal crear/editar)
//           app/components/profesor/ProfessorMenu.tsx      (popover Editar/Borrar)
//           app/components/profesor/StatusMessage.tsx      (mensaje centrado)
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  createProfessor,
  deleteProfessor,
  fetchProfessors,
  ProfessorUpdatePayload,
  ProfessorsApiError,
  updateProfessor,
} from '@/services/profesoresApi';
import { Professor } from '@/types';
import ProfessorDirectory from '@/components/profesor/ProfessorDirectory';
import ProfessorDetail from '@/components/profesor/ProfessorDetail';
import ProfessorForm from '@/components/profesor/ProfessorForm';
import ProfessorMenu from '@/components/profesor/ProfessorMenu';
import {
  describeError,
  EMPTY_FORM,
  FormMode,
  FormValues,
  MenuAnchor,
} from '@/components/profesor/profesorTypes';
import { profesorStyles as styles } from '@/components/profesor/profesorStyles';

export default function ProfessorScreen() {
  const insets = useSafeAreaInsets();
  // Ancho de pantalla, usado por el menú kebab para posicionarse desde la derecha
  const { width: windowWidth } = useWindowDimensions();

  // ── [ESTADO] Directorio ──
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── [ESTADO] Menú kebab (⋮) y formulario modal ──
  const [menu, setMenu] = useState<{ professor: Professor; anchor: MenuAnchor } | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── [SECCIÓN] Carga del directorio ───

  // Descarga la lista completa del directorio (GET /api/profesores)
  const loadProfessors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setProfessors(await fetchProfessors());
    } catch (loadError) {
      console.error('[ProfesorScreen] Failed to load professors:', loadError);
      setError(describeError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial de la lista al montar la pantalla
  useEffect(() => {
    void loadProfessors();
  }, [loadProfessors]);

  // ─── [SECCIÓN] Acciones del formulario (crear / editar) ───

  // Abre el modal en modo "crear" con el formulario vacío
  const openCreate = useCallback(() => {
    setMenu(null);
    setFormMode('create');
    setEditingProfessor(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormVisible(true);
  }, []);

  // Abre el modal en modo "editar" precargado con los datos del profesor dado
  const openEdit = useCallback((professor: Professor) => {
    setMenu(null);
    setFormMode('edit');
    setEditingProfessor(professor);
    setForm({
      nombre: professor.nombre,
      apellido: professor.apellido,
      resumen: professor.bio,
      titulos: professor.specialty,
      experiencia_laboral: professor.experience,
      url_imagen: professor.imageUrl,
    });
    setFormError(null);
    setFormVisible(true);
  }, []);

  // Actualiza un campo del formulario y limpia el error de validación
  const updateField = useCallback((field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }, []);

  // Valida y envía el formulario: POST al crear, PUT al editar
  const submitForm = useCallback(async () => {
    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    const resumen = form.resumen.trim();

    // Validación mínima del lado del cliente (la API puede exigir más)
    if (!nombre || !apellido || !resumen) {
      setFormError('Nombre, apellido y resumen son obligatorios.');
      return;
    }

    const payload: ProfessorUpdatePayload = {
      nombre,
      apellido,
      resumen,
      titulos: form.titulos.trim(),
      experiencia_laboral: form.experiencia_laboral.trim(),
      url_imagen: form.url_imagen.trim(),
    };

    setSaving(true);
    setFormError(null);

    try {
      if (formMode === 'create') {
        // Crear: el servidor devuelve el registro con su id → se agrega arriba de la lista
        const created = await createProfessor(payload);
        setProfessors((prev) => [created, ...prev]);
      } else if (editingProfessor) {
        // Editar: se reemplaza el registro en la lista y en la ficha seleccionada
        const updated = await updateProfessor(editingProfessor.id, payload);
        setProfessors((prev) => prev.map((professor) => (professor.id === updated.id ? updated : professor)));
        setSelectedProfessor((prev) => (prev && prev.id === updated.id ? updated : prev));
      }
      setFormVisible(false);
    } catch (saveError) {
      console.error('[ProfesorScreen] Failed to save professor:', saveError);
      setFormError(
        saveError instanceof ProfessorsApiError && saveError.status
          ? `La API respondió con un error (${saveError.status}).`
          : 'No pudimos guardar los cambios.',
      );
    } finally {
      setSaving(false);
    }
  }, [form, formMode, editingProfessor]);

  // ─── [SECCIÓN] Eliminar profesor ───

  // Pide confirmación con un Alert nativo y luego llama al DELETE
  const confirmDelete = useCallback((professor: Professor) => {
    setMenu(null);
    Alert.alert(
      '¿Eliminar profesor?',
      `Se eliminará la ficha de ${professor.name} del directorio.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteProfessor(professor.id);
                // Quita el registro de la lista y de la ficha abierta, si coincidía
                setProfessors((prev) => prev.filter((item) => item.id !== professor.id));
                setSelectedProfessor((prev) => (prev && prev.id === professor.id ? null : prev));
              } catch (deleteError) {
                console.error('[ProfesorScreen] Failed to delete professor:', deleteError);
                Alert.alert('No pudimos eliminar al profesor.', describeError(deleteError));
              }
            })();
          },
        },
      ],
    );
  }, []);

  // ─── [SECCIÓN] Render ───

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Fondo decorativo "aero": brillos circulares + línea de luz superior */}
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.aeroGlow, styles.glowTop]} />
        <View style={[styles.aeroGlow, styles.glowBottom]} />
        <View style={styles.aeroHighlight} />
      </View>

      {/* Encabezado: el título cambia según estemos en lista o en detalle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>POKÉDEX / PROFESOR</Text>
          <Text style={styles.title}>{selectedProfessor ? 'conoce a tu mentor.' : 'aprende de los expertos.'}</Text>
        </View>
        <View style={styles.headerMark}>
          <Ionicons name="school" size={20} color="#275972" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vista: ficha de detalle si hay selección; si no, el directorio
            (que él mismo maneja los estados de carga, error y vacío) */}
        {selectedProfessor ? (
          <ProfessorDetail professor={selectedProfessor} onBack={() => setSelectedProfessor(null)} />
        ) : (
          <ProfessorDirectory
            professors={professors}
            loading={loading}
            error={error}
            onSelect={setSelectedProfessor}
            onOpenCreate={openCreate}
            onOpenMenu={(professor, anchor) => setMenu({ professor, anchor })}
            onRetry={() => void loadProfessors()}
          />
        )}
      </ScrollView>

      {/* Menú contextual "Editar / Borrar" anclado al botón ⋮ */}
      <ProfessorMenu
        menu={menu}
        windowWidth={windowWidth}
        onEdit={openEdit}
        onDelete={confirmDelete}
        onClose={() => setMenu(null)}
      />

      {/* Modal de formulario crear / editar */}
      <ProfessorForm
        visible={formVisible}
        mode={formMode}
        form={form}
        formError={formError}
        saving={saving}
        onChangeField={updateField}
        onSubmit={() => void submitForm()}
        onClose={() => {
          if (!saving) setFormVisible(false);
        }}
      />
    </View>
  );
}
