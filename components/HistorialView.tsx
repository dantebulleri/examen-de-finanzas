"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  RefreshCw,
  TrendingUp,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cargarHistorial, borrarHistorial } from "@/lib/storage";
import { formatFecha, formatTiempo } from "@/lib/utils";
import type { ResultadoExamen } from "@/types/pregunta";

export function HistorialView() {
  const router = useRouter();
  const [historial, setHistorial] = useState<ResultadoExamen[]>([]);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  useEffect(() => {
    setHistorial(cargarHistorial());
  }, []);

  const handleBorrar = () => {
    borrarHistorial();
    setHistorial([]);
    setConfirmarBorrar(false);
  };

  const aciertoPorTemaAgregado = calcularAciertosPorTema(historial);

  const datosGrafico = historial.map((r, i) => ({
    examen: i + 1,
    nota: r.nota,
    fecha: formatFecha(r.fecha).split(",")[0],
  }));

  const promedio =
    historial.length > 0
      ? (historial.reduce((acc, r) => acc + r.nota, 0) / historial.length).toFixed(2)
      : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-3xl mx-auto pt-6 pb-16 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Historial
            </h1>
            {historial.length > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {historial.length} examen{historial.length !== 1 ? "es" : ""} rendido{historial.length !== 1 ? "s" : ""} · Promedio:{" "}
                <span className="font-semibold text-blue-600">{promedio}/10</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {historial.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmarBorrar(true)}
                className="text-red-600 hover:bg-red-50 border-red-200 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Borrar
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Nuevo
            </Button>
          </div>
        </div>

        {historial.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Todavía no rendiste ningún examen</p>
            <p className="text-sm mt-1">Tus resultados aparecerán acá</p>
          </div>
        ) : (
          <>
            {/* Gráfico de notas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Evolución de notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={datosGrafico} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="examen"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Examen #", position: "insideBottom", offset: -2, fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => {
                        const n = typeof value === "number" ? value : parseFloat(String(value));
                        return [`${n.toFixed(1)}/10`, "Nota"];
                      }}
                      labelFormatter={(label) => `Examen #${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="nota"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aciertos por tema */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Aciertos por tema (peor a mejor)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aciertoPorTemaAgregado.map(({ tema, correctas, total }) => {
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
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Lista de exámenes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Exámenes rendidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {[...historial].reverse().map((r) => {
                    const colorNota =
                      r.nota >= 7
                        ? "success"
                        : r.nota >= 4
                        ? "warning"
                        : "destructive";
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {formatFecha(r.fecha)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {r.preguntas.length} preguntas · {formatTiempo(r.tiempoUsadoSeg)}
                          </p>
                        </div>
                        <Badge variant={colorNota}>
                          {r.nota.toFixed(1)}/10
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={confirmarBorrar} onOpenChange={setConfirmarBorrar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Borrar todo el historial?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Se eliminarán todos los
                exámenes guardados ({historial.length} en total).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmarBorrar(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleBorrar}
              >
                Sí, borrar todo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function calcularAciertosPorTema(
  historial: ResultadoExamen[]
): { tema: string; correctas: number; total: number }[] {
  const mapa: Record<string, { correctas: number; total: number }> = {};
  for (const resultado of historial) {
    for (const [tema, datos] of Object.entries(resultado.aciertoPorTema)) {
      if (!mapa[tema]) mapa[tema] = { correctas: 0, total: 0 };
      mapa[tema].correctas += datos.correctas;
      mapa[tema].total += datos.total;
    }
  }
  return Object.entries(mapa)
    .map(([tema, datos]) => ({ tema, ...datos }))
    .sort((a, b) => a.correctas / a.total - b.correctas / b.total);
}
