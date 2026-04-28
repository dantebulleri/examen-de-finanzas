"use client";

import { useState } from "react";
import { FormulaRenderer } from "@/components/FormulaRenderer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Pregunta } from "@/types/pregunta";
import { parsearRespuestaNumeric } from "@/lib/exam-utils";

interface PreguntaCardProps {
  pregunta: Pregunta;
  respuesta: number | boolean | null;
  onRespuesta: (valor: number | boolean | null) => void;
}

const DIFICULTAD_COLOR = {
  facil: "success" as const,
  media: "warning" as const,
  dificil: "destructive" as const,
};

const DIFICULTAD_LABEL = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

export function PreguntaCard({ pregunta, respuesta, onRespuesta }: PreguntaCardProps) {
  const [inputNumerico, setInputNumerico] = useState(
    respuesta !== null && respuesta !== undefined ? String(respuesta) : ""
  );

  const handleNumericoChange = (valor: string) => {
    setInputNumerico(valor);
    const parsed = parsearRespuestaNumeric(valor);
    onRespuesta(parsed);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant={DIFICULTAD_COLOR[pregunta.dificultad]}>
          {DIFICULTAD_LABEL[pregunta.dificultad]}
        </Badge>
        <Badge variant="outline">{pregunta.tema}</Badge>
        <Badge variant="secondary">
          {pregunta.tipo === "multiple_choice"
            ? "Opción múltiple"
            : pregunta.tipo === "numeric"
            ? "Numérico"
            : "Verdadero / Falso"}
        </Badge>
        <span className="text-xs text-slate-400 ml-auto">
          ~{pregunta.tiempo_estimado_min} min
        </span>
      </div>

      <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200">
        <FormulaRenderer text={pregunta.enunciado} />
      </div>

      {pregunta.tipo === "multiple_choice" && pregunta.opciones && (
        <div className="space-y-2">
          {pregunta.opciones.map((opcion, idx) => (
            <button
              key={idx}
              onClick={() => onRespuesta(idx)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm",
                respuesta === idx
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  : "border-slate-200 dark:border-slate-600 hover:border-blue-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <span className="font-semibold mr-2 text-slate-400">
                {String.fromCharCode(65 + idx)})
              </span>
              <FormulaRenderer text={opcion} />
            </button>
          ))}
        </div>
      )}

      {pregunta.tipo === "verdadero_falso" && (
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              onClick={() => onRespuesta(val)}
              className={cn(
                "flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all",
                respuesta === val
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 dark:border-slate-600 hover:border-blue-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              {val ? "Verdadero" : "Falso"}
            </button>
          ))}
        </div>
      )}

      {pregunta.tipo === "numeric" && (
        <div className="space-y-2">
          <label className="text-sm text-slate-600 dark:text-slate-400">
            Tu respuesta (usá punto o coma como decimal):
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={inputNumerico}
            onChange={(e) => handleNumericoChange(e.target.value)}
            placeholder="Ej: 1234,56 o 1234.56"
            className="w-full px-4 py-3 border-2 rounded-lg text-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
          />
          {pregunta.tolerancia && (
            <p className="text-xs text-slate-400">
              Tolerancia: ±{pregunta.tolerancia}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}
