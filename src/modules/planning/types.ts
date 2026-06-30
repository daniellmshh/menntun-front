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

export enum EjeArticulador {
  PENSAMIENTO_CRITICO = "PENSAMIENTO_CRITICO",
  VIDA_SALUDABLE = "VIDA_SALUDABLE",
  INCLUSION = "INCLUSION",
  INTERCULTURALIDAD_CRITICA = "INTERCULTURALIDAD_CRITICA",
  IGUALDAD_GENERO = "IGUALDAD_GENERO",
  ARTE_CULTURA = "ARTE_CULTURA",
  APROPIACION_TECNOLOGIA = "APROPIACION_TECNOLOGIA",
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

export interface PlanningFase {
  orden: number;
  nombre: string;
  actividades: string;
}

export interface PlanningRecursos {
  espacios?: string;
  tiempos?: string;
  materiales?: string;
}

export interface SugerenciaIA {
  hayDiscrepancia: boolean;
  modalidadSugerida: string | null;
  campoFormativoSugerido: string | null;
  ejesArticuladoresSugeridos: string[] | null;
  justificacion: string | null;
}

export interface GeneratePlanningDto {
  contextoInicial: string;
  modalidad?: PlanningModalidad;
  campoFormativo?: CampoFormativo;
  ejesArticuladores?: EjeArticulador[];
  groupId?: string;
  subjectId?: string;
  standaloneLevel?: NivelEducativo;
  standaloneGradeOrder?: number;
}

export interface UpdatePlanningDto {
  title?: string;
  contenidos?: string;
  pda?: string;
  relevanciaSocial?: string;
  produccionSugerida?: string;
  fases?: PlanningFase[];
  recursos?: PlanningRecursos;
  campoFormativo?: CampoFormativo;
  ejesArticuladores?: EjeArticulador[];
  status?: PlanningStatus;
}

export interface Planning {
  id: string;
  title: string;
  modalidad: PlanningModalidad;
  campoFormativo: CampoFormativo;
  ejesArticuladores: EjeArticulador[];
  contextoInicial: string;
  contenidos?: string | null;
  pda?: string | null;
  relevanciaSocial?: string | null;
  produccionSugerida?: string | null;
  fases: PlanningFase[];
  recursos?: PlanningRecursos | null;
  content: string;
  weekStart?: string | null;
  status: PlanningStatus;
  createdAt: string;
  updatedAt: string;
  teacherProfileId: string;
  groupId?: string | null;
  subjectId?: string | null;
  group?: {
    id: string;
    name: string;
    section?: string | null;
    grade: {
      name: string;
    };
  } | null;
  subject?: {
    id: string;
    name: string;
    code: string;
  } | null;
  standaloneLevel?: NivelEducativo | null;
  standaloneGradeOrder?: number | null;
}

export interface GeneratePlanningResponse {
  planning: Planning;
  sugerenciaIA: SugerenciaIA | null;
}
