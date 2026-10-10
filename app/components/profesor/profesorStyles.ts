// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/profesor/profesorStyles.ts
// FUNCIÓN:  StyleSheet compartido de todo el módulo de profesores
// USADO POR: profesor.tsx y todas las piezas de app/components/profesor/
// CAMBIOS:  paleta aero → bloques screen/header | tarjetas del directorio →
//           sección "Directorio" | menú kebab → sección "Popover" |
//           modal de alta/edición → sección "Formulario"
// ──────────────────────────────────────────────────────────────

import { StyleSheet } from 'react-native';

// Paleta aero del módulo:
// fondo #d9edf8 | texto #123247 | acentos #35627a / #275972 | error #d86a5d | peligro #c0392b
export const profesorStyles = StyleSheet.create({
  // ── Fondo y encabezado (los usa el orquestador profesor.tsx) ──
  screen: { backgroundColor: '#d9edf8', flex: 1, overflow: 'hidden', paddingHorizontal: 20 },
  backgroundLayer: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  aeroGlow: { borderRadius: 180, position: 'absolute' },
  glowTop: { backgroundColor: 'rgba(255, 255, 255, 0.62)', height: 270, right: -95, top: -95, width: 270 },
  glowBottom: { backgroundColor: 'rgba(99, 181, 225, 0.32)', bottom: -125, height: 300, left: -120, width: 300 },
  aeroHighlight: { backgroundColor: 'rgba(255, 255, 255, 0.32)', height: 1, left: 0, position: 'absolute', right: 0, top: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 18, paddingTop: 14 },
  eyebrow: { color: '#35627a', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#123247', fontSize: 27, fontWeight: '900' },
  headerMark: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.36)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, borderWidth: 1.5, height: 40, justifyContent: 'center', width: 40 },
  content: { paddingBottom: 24 },

  // ── Directorio: contador, tarjetas y avatares ──
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kicker: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  count: { color: '#4e7184', fontSize: 11, fontWeight: '800' },
  list: { gap: 12 },
  professorCard: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, flexDirection: 'row', gap: 6, padding: 15 },
  addCard: { borderStyle: 'dashed', borderColor: 'rgba(39, 89, 114, 0.45)', marginBottom: 12 },
  cardBody: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 13 },
  avatar: { alignItems: 'center', backgroundColor: 'rgba(217, 237, 248, 0.9)', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  cardCopy: { flex: 1 },
  professorName: { color: '#123247', fontSize: 18, fontWeight: '900' },
  cardId: { color: '#4e7184', fontSize: 11, fontWeight: '800' },
  cardResumen: { color: '#4e7184', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 5 },
  kebabButton: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  avatarImage: { backgroundColor: 'rgba(217, 237, 248, 0.9)', borderRadius: 28, height: 56, width: 56 },

  // ── Menú kebab (popover) ──
  backdrop: { backgroundColor: 'rgba(18, 50, 71, 0.28)', flex: 1 },
  popover: { backgroundColor: 'rgba(255, 255, 255, 0.97)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, minWidth: 170, paddingVertical: 6, position: 'absolute', shadowColor: '#123247', shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 8 },
  popoverItem: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  popoverItemPressed: { backgroundColor: 'rgba(217, 237, 248, 0.9)' },
  popoverItemText: { color: '#275972', fontSize: 14, fontWeight: '800' },
  popoverItemDanger: { color: '#c0392b' },
  pressed: { opacity: 0.72 },

  // ── Estados vacíos / carga / error ──
  status: { alignItems: 'center', gap: 14, justifyContent: 'center', minHeight: 180, padding: 20 },
  statusText: { color: '#4e7184', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  retryButton: { backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 15, paddingVertical: 11 },
  retryLabel: { color: '#275972', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },

  // ── Ficha de detalle (ProfessorDetail) ──
  detail: { flex: 1 },
  backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 7, marginBottom: 18, minHeight: 36 },
  backLabel: { color: '#275972', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  detailHero: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.42)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 18, borderWidth: 1.5, marginBottom: 14, padding: 20 },
  detailAvatar: { alignItems: 'center', backgroundColor: 'rgba(217, 237, 248, 0.9)', borderRadius: 40, height: 80, justifyContent: 'center', marginBottom: 14, width: 80 },
  detailAvatarImage: { backgroundColor: 'rgba(217, 237, 248, 0.9)', borderRadius: 40, height: 80, marginBottom: 14, width: 80 },
  detailName: { color: '#123247', fontSize: 30, fontWeight: '900', marginTop: 7 },
  detailSpecialty: { color: '#35627a', fontSize: 15, fontWeight: '800', marginTop: 5 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metaCard: { backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, flex: 1, minHeight: 122, padding: 13 },
  metaLabel: { color: '#4e7184', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  metaValue: { color: '#123247', fontSize: 14, fontWeight: '800', marginTop: 6 },
  sectionTitle: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7, marginBottom: 10, marginTop: 6 },
  descriptionBox: { backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, marginBottom: 20, padding: 17 },
  description: { color: '#31586d', fontSize: 16, lineHeight: 24 },
  subjects: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subject: { backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 13, paddingVertical: 10 },
  subjectText: { color: '#275972', fontSize: 13, fontWeight: '800' },

  // ── Modal formulario (crear / editar) ──
  formScreen: { backgroundColor: '#d9edf8', flex: 1 },
  formHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14, paddingHorizontal: 20 },
  formTitle: { color: '#123247', fontSize: 21, fontWeight: '900', letterSpacing: 0.6 },
  closeButton: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 18, borderWidth: 1.5, height: 36, justifyContent: 'center', width: 36 },
  formContent: { gap: 14, paddingBottom: 24, paddingHorizontal: 20 },
  field: {},
  fieldLabel: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.78)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, borderWidth: 1.5, color: '#123247', fontSize: 14, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 12 },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  formError: { color: '#c0392b', fontSize: 13, fontWeight: '700', marginTop: 2 },
  formActions: { borderTopColor: 'rgba(255, 255, 255, 0.7)', borderTopWidth: 1.5, flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12 },
  cancelButton: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, flex: 1, paddingVertical: 14 },
  cancelLabel: { color: '#275972', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  saveButton: { alignItems: 'center', backgroundColor: '#275972', borderRadius: 14, flex: 1, paddingVertical: 14 },
  saveButtonDisabled: { opacity: 0.6 },
  saveLabel: { color: '#ffffff', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
});
