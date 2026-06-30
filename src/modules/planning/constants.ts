import {
  FolderKanban,
  Gamepad2,
  Target,
  Hammer,
  Grid,
  BookOpen,
} from "lucide-react";

export const PlanningModalidadLabels: Record<string, string> = {
  PROYECTOS: "Proyectos",
  ABJ: "Aprendizaje Basado en Juegos (ABJ)",
  CENTROS_INTERES: "Centros de Interés",
  TALLERES_CRITICOS: "Talleres Críticos",
  RINCONES_APRENDIZAJE: "Rincones de Aprendizaje",
  UNIDADES_DIDACTICAS: "Unidades Didácticas",
};

export const PlanningModalidadIcons: Record<string, any> = {
  PROYECTOS: FolderKanban,
  ABJ: Gamepad2,
  CENTROS_INTERES: Target,
  TALLERES_CRITICOS: Hammer,
  RINCONES_APRENDIZAJE: Grid,
  UNIDADES_DIDACTICAS: BookOpen,
};

export const CampoFormativoLabels: Record<string, string> = {
  LENGUAJES: "Lenguajes",
  SABERES_PENSAMIENTO_CIENTIFICO: "Saberes y Pensamiento Científico",
  ETICA_NATURALEZA_SOCIEDADES: "Ética, Naturaleza y Sociedades",
  HUMANO_COMUNITARIO: "De lo Humano y lo Comunitario",
};

export const EjeArticuladorLabels: Record<string, string> = {
  PENSAMIENTO_CRITICO: "Pensamiento Crítico",
  VIDA_SALUDABLE: "Vida Saludable",
  INCLUSION: "Inclusión",
  INTERCULTURALIDAD_CRITICA: "Interculturalidad Crítica",
  IGUALDAD_GENERO: "Igualdad de Género",
  ARTE_CULTURA: "Artes y Experiencias Estéticas",
  APROPIACION_TECNOLOGIA: "Apropiación de las Culturas a través de la Lectura y la Escritura",
};
