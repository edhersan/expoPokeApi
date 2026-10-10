// ──────────────────────────────────────────────────────────────
// ARCHIVO:  services/profesoresApi.ts
// FUNCIÓN:  Conexión CRUD con la API de profesores/docentes
// DEPENDE:  constants/profesores.ts (PROFESORES_API_URL), types/index.ts (Professor)
// USADO POR: app/(tabs)/profesor.tsx (pestaña "Profesor")
// CAMBIOS:  URL base → constants/profesores.ts | campos del formulario → ProfessorUpdatePayload
//           y app/(tabs)/profesor.tsx (FormValues / FormField)
// ──────────────────────────────────────────────────────────────

import { PROFESORES_API_URL } from '@/constants/profesores';
import { Professor } from '@/types';

// Respuesta cruda de la API de profesores (campos en español, sin `name` ni `subjects`)
interface ProfessorApiResponse {
  id: number;
  nombre: string;
  apellido: string;
  resumen: string;
  titulos: string;
  experiencia_laboral: string;
  url_imagen: string;
}

// Payload que se envía al crear/actualizar un profesor (POST / PUT)
// Debe coincidir con los campos del formulario en app/(tabs)/profesor.tsx
export interface ProfessorUpdatePayload {
  nombre: string;
  apellido: string;
  resumen: string;
  titulos: string;
  experiencia_laboral: string;
  url_imagen: string;
}

// Error propio de esta API: lleva el código HTTP y el cuerpo del error
// Lo captura y traduce a mensaje en español app/(tabs)/profesor.tsx (describeError)
export class ProfessorsApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: string,
  ) {
    super(message);
    this.name = 'ProfessorsApiError';
  }
}

// Divide el texto de títulos en lista (separados por coma, punto y coma o salto de línea)
// Resultado: array que se muestra como "ÁREAS DE ESTUDIO" en la ficha del profesor
function splitTitles(titles: string): string[] {
  return titles
    .split(/[,;\n]+/)
    .map((title) => title.trim())
    .filter(Boolean);
}

// Convierte la respuesta de la API (español) al tipo `Professor` que usa la UI,
// rellenando con valores por defecto los campos vacíos
function mapProfessor(professor: ProfessorApiResponse): Professor {
  return {
    id: professor.id,
    nombre: professor.nombre,
    apellido: professor.apellido,
    name: `${professor.nombre} ${professor.apellido}`.trim(),
    specialty: professor.titulos || 'Docente',
    experience: professor.experiencia_laboral || 'Experiencia no disponible',
    bio: professor.resumen || 'No hay resumen disponible.',
    subjects: splitTitles(professor.titulos || 'Docencia'),
    imageUrl: professor.url_imagen,
  };
}

// Helper genérico de peticiones: arma la URL, ejecuta fetch y lanza ProfessorsApiError si falla
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PROFESORES_API_URL}${path}`, init);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ProfesoresAPI] Request failed:', {
      status: response.status,
      url: response.url,
      body: errorText,
    });
    throw new ProfessorsApiError('PROFESSORS_UNAVAILABLE', response.status, errorText);
  }

  return response.json() as Promise<T>;
}

// GET /api/profesores → lista completa del directorio
export async function fetchProfessors(): Promise<Professor[]> {
  const professors = await requestJson<ProfessorApiResponse[]>('/api/profesores');

  if (!Array.isArray(professors)) {
    throw new ProfessorsApiError('INVALID_PROFESSORS_RESPONSE');
  }

  return professors.map(mapProfessor);
}

// POST /api/profesores → crea un profesor nuevo y lo devuelve con su id
export async function createProfessor(payload: ProfessorUpdatePayload): Promise<Professor> {
  const created = await requestJson<ProfessorApiResponse>('/api/profesores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return mapProfessor(created);
}

// PUT /api/profesores/{id} → actualiza un profesor existente por su id
export async function updateProfessor(id: number, payload: ProfessorUpdatePayload): Promise<Professor> {
  const updated = await requestJson<ProfessorApiResponse>(`/api/profesores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return mapProfessor(updated);
}

// DELETE /api/profesores/{id} → elimina un profesor (sin cuerpo de respuesta)
export async function deleteProfessor(id: number): Promise<void> {
  const response = await fetch(`${PROFESORES_API_URL}/api/profesores/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ProfesoresAPI] Delete failed:', {
      status: response.status,
      url: response.url,
      body: errorText,
    });
    throw new ProfessorsApiError('PROFESSOR_DELETE_FAILED', response.status, errorText);
  }
}
