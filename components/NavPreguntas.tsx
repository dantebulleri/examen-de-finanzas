"use client";

import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import type { RespuestaUsuario } from "@/types/pregunta";

interface NavPreguntasProps {
  total: number;
  indiceActual: number;
  respuestas: Record<string, RespuestaUsuario>;
  preguntaIds: string[];
  onNavegar: (indice: number) => void;
}

export function NavPreguntas({
  total,
  indiceActual,
  respuestas,
  preguntaIds,
  onNavegar,
}: NavPreguntasProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const id = preguntaIds[i];
        const resp = respuestas[id];
        const respondida = resp?.respuesta !== undefined && resp?.respuesta !== null;
        const marcada = resp?.marcadaParaRevisar;
        const activa = i === indiceActual;

        return (
          <button
            key={i}
            onClick={() => onNavegar(i)}
            className={cn(
              "relative w-8 h-8 rounded-md text-xs font-semibold border transition-all flex items-center justify-center",
              activa
                ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300"
                : respondida && marcada
                ? "bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-200"
                : respondida
                ? "bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-200"
                : marcada
                ? "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300"
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300"
            )}
          >
            {i + 1}
            {marcada && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                <Bookmark className="w-2 h-2 text-yellow-900" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LeyendaNav() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3">
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block" />
        Sin responder
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block" />
        Respondida
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-400 inline-block" />
        Marcada
      </span>
    </div>
  );
}
