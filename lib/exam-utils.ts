import type {
  Pregunta,
  ConfigExamen,
  RespuestaUsuario,
  PreguntaConRespuesta,
  ResultadoExamen,
  SesionExamen,
} from "@/types/pregunta";

export function filtrarPreguntas(
  banco: Pregunta[],
  config: ConfigExamen
): Pregunta[] {
  let filtradas = [...banco];

  if (config.temas.length > 0) {
    filtradas = filtradas.filter((p) => config.temas.includes(p.tema));
  }

  if (config.dificultad !== "todas" && config.dificultad !== "mixto") {
    filtradas = filtradas.filter((p) => p.dificultad === config.dificultad);
  }

  return filtradas;
}

export function seleccionarPreguntas(
  banco: Pregunta[],
  config: ConfigExamen
): { preguntas: Pregunta[]; advertencia: string | null } {
  const filtradas = filtrarPreguntas(banco, config);

  if (filtradas.length === 0) {
    return {
      preguntas: [],
      advertencia:
        "No hay preguntas que coincidan con los filtros seleccionados.",
    };
  }

  const cantidad = Math.min(config.cantidadPreguntas, filtradas.length);
  let advertencia: string | null = null;

  if (filtradas.length < config.cantidadPreguntas) {
    advertencia = `Solo hay ${filtradas.length} pregunta${filtradas.length !== 1 ? "s" : ""} disponible${filtradas.length !== 1 ? "s" : ""} con esos filtros. El examen tendrá ${filtradas.length} pregunta${filtradas.length !== 1 ? "s" : ""}.`;
  }

  const shuffled = [...filtradas].sort(() => Math.random() - 0.5);
  return { preguntas: shuffled.slice(0, cantidad), advertencia };
}

export function calcularTiempoAuto(preguntas: Pregunta[]): number {
  return preguntas.reduce((acc, p) => acc + p.tiempo_estimado_min, 0);
}

export function esRespuestaCorrecta(
  pregunta: Pregunta,
  respuesta: number | boolean | null
): boolean {
  if (respuesta === null) return false;

  if (pregunta.tipo === "verdadero_falso") {
    return respuesta === pregunta.respuesta_correcta;
  }

  if (pregunta.tipo === "multiple_choice") {
    return respuesta === pregunta.respuesta_correcta;
  }

  if (pregunta.tipo === "numeric") {
    const valorCorrecto = pregunta.respuesta_correcta as number;
    const tolerancia = pregunta.tolerancia ?? 0;
    const valorUsuario = respuesta as number;

    if (tolerancia === 0) {
      return Math.abs(valorUsuario - valorCorrecto) < 0.01;
    }
    const margen = Math.abs(valorCorrecto) * (tolerancia / 100);
    return Math.abs(valorUsuario - valorCorrecto) <= margen;
  }

  return false;
}

export function calcularResultados(
  preguntas: Pregunta[],
  respuestas: Record<string, RespuestaUsuario>,
  tiempoUsadoSeg: number,
  tiempoLimiteSeg: number
): ResultadoExamen {
  const preguntasConRespuesta: PreguntaConRespuesta[] = preguntas.map((p) => {
    const resp = respuestas[p.id];
    const respuestaUsuario = resp?.respuesta ?? null;
    return {
      ...p,
      respuestaUsuario,
      esCorrecta: esRespuestaCorrecta(p, respuestaUsuario),
    };
  });

  const correctas = preguntasConRespuesta.filter((p) => p.esCorrecta).length;
  const porcentajeAciertos = Math.round((correctas / preguntas.length) * 100);
  const nota = Math.round((correctas / preguntas.length) * 10 * 100) / 100;

  const aciertoPorTema: Record<string, { correctas: number; total: number }> =
    {};
  for (const p of preguntasConRespuesta) {
    if (!aciertoPorTema[p.tema]) {
      aciertoPorTema[p.tema] = { correctas: 0, total: 0 };
    }
    aciertoPorTema[p.tema].total++;
    if (p.esCorrecta) aciertoPorTema[p.tema].correctas++;
  }

  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    preguntas: preguntasConRespuesta,
    tiempoUsadoSeg,
    tiempoLimiteSeg,
    nota,
    porcentajeAciertos,
    aciertoPorTema,
  };
}

export function crearSesion(
  config: ConfigExamen,
  preguntas: Pregunta[]
): SesionExamen {
  const tiempoMin =
    config.tiempoLimiteMin === "auto"
      ? calcularTiempoAuto(preguntas)
      : config.tiempoLimiteMin;

  return {
    config,
    preguntas,
    respuestas: {},
    indicePreguntaActual: 0,
    inicioTimestamp: Date.now(),
    tiempoLimiteSeg: tiempoMin * 60,
    finalizado: false,
  };
}

export function getTemasUnicos(banco: Pregunta[]): string[] {
  return Array.from(new Set(banco.map((p) => p.tema))).sort();
}

export function parsearRespuestaNumeric(valor: string): number | null {
  const normalizado = valor.replace(",", ".");
  const numero = parseFloat(normalizado);
  return isNaN(numero) ? null : numero;
}
