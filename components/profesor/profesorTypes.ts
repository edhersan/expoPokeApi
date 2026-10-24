// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/profesor/profesorTypes.ts
// FUNCIÓN:  Tipos, constantes y helpers compartidos del módulo de profesores
// USADO POR: profesor.tsx (orquestador), ProfessorForm, ProfessorMenu, ProfessorDirectory
// CAMBIOS:  campos del formulario → FormValues + EMPTY_FORM |
//           mensajes de error de la API → describeError()
// ──────────────────────────────────────────────────────────────

import { ProfessorsApiError } from '@/services/profesoresApi';

// Modo del formulario modal: crear un registro nuevo o editar uno existente
export type FormMode = 'create' | 'edit';

// Posición y tamaño del botón "⋮" (kebab) en pantalla, para anclar el menú contextual
export interface MenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Campos del formulario; coinciden con ProfessorUpdatePayload del servicio
export interface FormValues {
  nombre: string;
  apellido: string;
  resumen: string;
  titulos: string;
  experiencia_laboral: string;
  url_imagen: string;
}

// Formulario vacío, base al crear un profesor nuevo
export const EMPTY_FORM: FormValues = {
  nombre: '',
  apellido: '',
  resumen: '',
  titulos: '',
  experiencia_laboral: '',
  url_imagen: '',
};

// Convierte un error del servicio en mensaje amigable (con código HTTP si existe)
// Los cambios se guardan siempre en local; este mensaje cubre fallos de escritura
// o errores del servidor durante la sincronización en segundo plano.
export function describeError(error: unknown): string {
  if (error instanceof ProfessorsApiError && error.status) {
    return `El servidor respondió con un error (${error.status}).`;
  }
  return 'No pudimos guardar el cambio en este dispositivo.';
}
