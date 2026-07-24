export enum PlanningModalidad {
  PROYECTOS = "PROYECTOS",
  ABJ = "ABJ",
  CENTROS_INTERES = "CENTROS_INTERES",
  TALLERES_CRITICOS = "TALLERES_CRITICOS",
  RINCONES_APRENDIZAJE = "RINCONES_APRENDIZAJE",
  UNIDADES_DIDACTICAS = "UNIDADES_DIDACTICAS",
}

export enum CampoFormativo {
  LENGUAJES = "LENGUAJES",
  SABERES_PENSAMIENTO_CIENTIFICO = "SABERES_PENSAMIENTO_CIENTIFICO",
  ETICA_NATURALEZA_SOCIEDADES = "ETICA_NATURALEZA_SOCIEDADES",
  HUMANO_COMUNITARIO = "HUMANO_COMUNITARIO",
}

export enum NivelEducativo {
  PREESCOLAR = "PREESCOLAR",
  PRIMARIA = "PRIMARIA",
  SECUNDARIA = "SECUNDARIA",
}

export enum PlanningStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ─── Catálogo del servidor ────────────────────────────────────────────────────

export interface CatalogoContenido {
  id: string;       // e.g. "L_01"
  nombre: string;   // nombre_contenido
  pda?: Record<string, string | string[]>; // { grado_1: ["...", "..."], grado_2: "..." }
}

export interface CatalogoCampoFormativo {
  id: string;          // e.g. "LENGUAJES"
  nombre: string;      // "Lenguajes"
  finalidad: string;
  contenidos: CatalogoContenido[];
}

export interface CatalogoMetodologia {
  id: string;           // PlanningModalidad enum
  nombre: string;
  siglas: string;
  definicion: string;
  fases: string[];      // e.g. ["1. Punto de partida", "2. Planeación", ...]
}

export interface CatalogosOperativos {
  problematicas: string[];
  ajustesRazonables: string[];
  actividadesPmc: string[];
  instrumentosEvaluacion: string[];
}

export interface PlanningCatalogo {
  camposFormativos: CatalogoCampoFormativo[];
  ejesArticuladores: string[];
  metodologias: CatalogoMetodologia[];
  catalogosOperativos: CatalogosOperativos;
}

// ─── DTOs de generación ───────────────────────────────────────────────────────

export interface CampoSeleccionado {
  campoFormativoId: string;  // e.g. "LENGUAJES"
  contenidoId: string;       // e.g. "L_01"
  pdaLiteral: string;        // El texto exacto del PDA elegido por la maestra
}

export interface GeneratePlanningDto {
  // Curricular (new)
  camposSeleccionados: CampoSeleccionado[];
  modalidad: PlanningModalidad;
  ejesArticuladores?: string[];
  // Mode
  groupId?: string;
  subjectId?: string;
  standaloneLevel?: NivelEducativo;
  standaloneGradeOrder?: number;
  // Admin
  targetTeacherProfileId?: string;
  // Sara format
  periodoProyecto?: string;
  problematica: string;
  proposito: string;
  instrumentoEvaluacion?: string[];
  ajustesRazonables?: string[];
  actividadesPmc?: string[];
  contextoInicial?: string;
}

export interface UpdatePlanningDto {
  title?: string;
  periodoProyecto?: string;
  problematica?: string;
  proposito?: string;
  instrumentoEvaluacion?: string[];
  ajustesRazonables?: string[];
  actividadesPmc?: string[];
  fundamentacion?: FundamentacionItem[];
  matrizDidactica?: MatrizMomento[];
  ejesArticuladores?: string[];
  status?: PlanningStatus;
}

// ─── Formato Sara — Fundamentación y Matriz ───────────────────────────────────

export interface FundamentacionItem {
  campoFormativo: string;      // enum id e.g. "LENGUAJES"
  nombreCampo: string;         // "Lenguajes"
  contenido: string;           // nombre_contenido exacto
  pda: string;                 // PDA exacto del grado
}

export interface MatrizFila {
  actividades: string;
  campo_pda: string;
  organizacion: string;
  recursos: string;
  evaluacion: string;
}

export interface MatrizMomento {
  momento: string;             // e.g. "1. Punto de partida"
  filas: MatrizFila[];
}

// ─── Modelo Planning completo ─────────────────────────────────────────────────

export interface Planning {
  id: string;
  title: string;
  modalidad: PlanningModalidad;
  campoFormativo: CampoFormativo;
  ejesArticuladores: string[];
  contextoInicial: string;
  // Legacy fields
  contenidos?: string | null;
  pda?: string | null;
  relevanciaSocial?: string | null;
  produccionSugerida?: string | null;
  fases?: any[] | null;
  recursos?: any | null;
  content?: string | null;
  // New Sara format fields
  periodoProyecto?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  activitiesPerDay?: number | null;
  problematica?: string | null;
  proposito?: string | null;
  instrumentoEvaluacion?: string[];
  ajustesRazonables?: string[];
  actividadesPmc?: string[];
  fundamentacion?: FundamentacionItem[] | null;
  matrizDidactica?: MatrizMomento[] | null;
  // Meta
  weekStart?: string | null;
  status: PlanningStatus;
  createdAt: string;
  updatedAt: string;
  teacherProfileId: string;
  groupId?: string | null;
  subjectId?: string | null;
  isStandalone?: boolean;
  standaloneLevel?: NivelEducativo | null;
  standaloneGradeOrder?: number | null;
  group?: {
    id: string;
    name: string;
    section?: string | null;
    grade: { name: string; order: number; level: NivelEducativo };
  } | null;
  subject?: {
    id: string;
    name: string;
    code: string;
  } | null;
  teacherProfile?: {
    id: string;
    user: { firstName: string; lastName: string };
  } | null;
}

export interface GeneratePlanningResponse {
  planning: Planning;
}
