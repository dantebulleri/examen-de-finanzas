export type Dificultad = "facil" | "media" | "dificil";
export type TipoPregunta = "multiple_choice" | "numeric" | "verdadero_falso";

export interface Pregunta {
  id: string;
  tema: string;
  unidad: number;
  dificultad: Dificultad;
  fuente: string;
  tipo: TipoPregunta;
  enunciado: string;
  opciones?: string[];
  respuesta_correcta: number | boolean;
  tolerancia?: number;
  explicacion: string;
  tiempo_estimado_min: number;
}

export interface ConfigExamen {
  cantidadPreguntas: number;
  temas: string[];
  dificultad: "todas" | Dificultad | "mixto";
  tiempoLimiteMin: number | "auto";
}

export interface RespuestaUsuario {
  preguntaId: string;
  respuesta: number | boolean | null;
  marcadaParaRevisar: boolean;
}

export interface PreguntaConRespuesta extends Pregunta {
  respuestaUsuario: number | boolean | null;
  esCorrecta: boolean;
}

export interface ResultadoExamen {
  id: string;
  fecha: string;
  preguntas: PreguntaConRespuesta[];
  tiempoUsadoSeg: number;
  tiempoLimiteSeg: number;
  nota: number;
  porcentajeAciertos: number;
  aciertoPorTema: Record<string, { correctas: number; total: number }>;
}

export interface SesionExamen {
  config: ConfigExamen;
  preguntas: Pregunta[];
  respuestas: Record<string, RespuestaUsuario>;
  indicePreguntaActual: number;
  inicioTimestamp: number;
  tiempoLimiteSeg: number;
  finalizado: boolean;
}
