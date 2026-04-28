"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  BarChart2,
  RefreshCw,
  History,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormulaRenderer } from "@/components/FormulaRenderer";
import { formatTiempo, formatFecha } from "@/lib/utils";
import type { ResultadoExamen } from "@/types/pregunta";

interface ResultadosViewProps {
  resultado: ResultadoExamen;
}

export function ResultadosView({ resultado }: ResultadosViewProps) {
  const router = useRouter();
  const { nota, porcentajeAciertos, tiempoUsadoSeg, preguntas, aciertoPorTema, fecha } = resultado;

  const colorNota =
    nota >= 7 ? "text-green-600" : nota >= 4 ? "text-yellow-600" : "text-red-600";
  const bgNota =
    nota >= 7 ? "bg-green-50 dark:bg-green-900/20" : nota >= 4 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20";

  const temasOrdenados = Object.entries(aciertoPorTema).sort(
    (a, b) => a[1].correctas / a[1].total - b[1].correctas / b[1].total
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-3xl mx-auto pt-6 pb-16 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Resultados del examen
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatFecha(fecha)}
          </p>
        </div>

        {/* Resumen */}
        <div className={`rounded-2xl p-6 text-center ${bgNota}`}>
          <div className={`text-6xl font-black mb-2 ${colorNota}`}>
            {nota.toFixed(1)}
            <span className="text-2xl font-normal text-slate-400">/10</span>
          </div>
          <div className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
            {porcentajeAciertos}% de aciertos
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {preguntas.filter((p) => p.esCorrecta).length} correctas
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              {preguntas.filter((p) => !p.esCorrecta).length} incorrectas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              {formatTiempo(tiempoUsadoSeg)}
            </span>
          </div>
        </div>

        {/* Aciertos por tema */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Aciertos por tema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {temasOrdenados.map(([tema, { correctas, total }]) => {
              const pct = Math.round((correctas / total) * 100);
              const color =
                pct >= 70
                  ? "bg-green-500"
                  : pct >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500";
              return (
                <div key={tema}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {tema}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {correctas}/{total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Tabla de preguntas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              Detalle de respuestas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {preguntas.map((p, idx) => {
                const respuestaTexto = (() => {
                  if (p.respuestaUsuario === null) return "Sin responder";
                  if (p.tipo === "verdadero_falso")
                    return p.respuestaUsuario ? "Verdadero" : "Falso";
                  if (p.tipo === "multiple_choice" && p.opciones)
                    return `${String.fromCharCode(65 + (p.respuestaUsuario as number))}) ${p.opciones[p.respuestaUsuario as number]}`;
                  return String(p.respuestaUsuario);
                })();

                const correctaTexto = (() => {
                  if (p.tipo === "verdadero_falso")
                    return p.respuesta_correcta ? "Verdadero" : "Falso";
                  if (p.tipo === "multiple_choice" && p.opciones)
                    return `${String.fromCharCode(65 + (p.respuesta_correcta as number))}) ${p.opciones[p.respuesta_correcta as number]}`;
                  return String(p.respuesta_correcta);
                })();

                return (
                  <div key={p.id} className="p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">
                        {p.esCorrecta ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Pregunta {idx + 1} · {p.tema}
                        </p>
                        <div className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                          <FormulaRenderer text={p.enunciado} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-6 text-xs">
                      <div>
                        <span className="text-slate-400">Tu respuesta: </span>
                        <span
                          className={
                            p.esCorrecta
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          <FormulaRenderer text={respuestaTexto} />
                        </span>
                      </div>
                      {!p.esCorrecta && (
                        <div>
                          <span className="text-slate-400">Correcta: </span>
                          <span className="text-green-600 font-medium">
                            <FormulaRenderer text={correctaTexto} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Nuevo examen
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/historial")}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Historial
          </Button>
        </div>
      </div>
    </div>
  );
}
