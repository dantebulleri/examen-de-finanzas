"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, Clock, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { seleccionarPreguntas, crearSesion, getTemasUnicos } from "@/lib/exam-utils";
import { guardarSesion } from "@/lib/storage";
import type { Pregunta, ConfigExamen } from "@/types/pregunta";

interface ExamSetupProps {
  banco: Pregunta[];
}

const OPCIONES_CANTIDAD = [5, 10, 15, 20];

export function ExamSetup({ banco }: ExamSetupProps) {
  const router = useRouter();
  const temas = getTemasUnicos(banco);

  const [cantidad, setCantidad] = useState(10);
  const [temasSeleccionados, setTemasSeleccionados] = useState<string[]>([]);
  const [dificultad, setDificultad] = useState<ConfigExamen["dificultad"]>("todas");
  const [tiempoTipo, setTiempoTipo] = useState<"auto" | "manual">("auto");
  const [tiempoManual, setTiempoManual] = useState(30);
  const [advertencia, setAdvertencia] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTema = (tema: string) => {
    setTemasSeleccionados((prev) =>
      prev.includes(tema) ? prev.filter((t) => t !== tema) : [...prev, tema]
    );
  };

  const handleIniciar = () => {
    const config: ConfigExamen = {
      cantidadPreguntas: cantidad,
      temas: temasSeleccionados,
      dificultad,
      tiempoLimiteMin: tiempoTipo === "auto" ? "auto" : tiempoManual,
    };

    const { preguntas, advertencia: adv } = seleccionarPreguntas(banco, config);

    if (preguntas.length === 0) {
      setError(adv ?? "No hay preguntas disponibles.");
      setAdvertencia(null);
      return;
    }

    setError(null);
    setAdvertencia(adv);

    if (adv) {
      setTimeout(() => {
        const sesion = crearSesion(config, preguntas);
        guardarSesion(sesion);
        router.push("/examen");
      }, 1500);
    } else {
      const sesion = crearSesion(config, preguntas);
      guardarSesion(sesion);
      router.push("/examen");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Finanzas · Licenciatura en Economía · UNR
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            FinExam UNR
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configurá tu examen y empezá a practicar
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {advertencia && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{advertencia} Iniciando en un momento...</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Cantidad */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Cantidad de preguntas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {OPCIONES_CANTIDAD.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCantidad(n)}
                    className={`px-5 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                      cantidad === n
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 hover:border-blue-300 text-slate-700 dark:text-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Temas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Temas
              </CardTitle>
              <CardDescription>
                Dejá todo vacío para incluir todos los temas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {temas.map((tema) => (
                  <button
                    key={tema}
                    onClick={() => toggleTema(tema)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      temasSeleccionados.includes(tema)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                    }`}
                  >
                    {tema}
                  </button>
                ))}
              </div>
              {temasSeleccionados.length > 0 && (
                <button
                  onClick={() => setTemasSeleccionados([])}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  Limpiar selección
                </button>
              )}
            </CardContent>
          </Card>

          {/* Dificultad */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dificultad</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={dificultad}
                onValueChange={(v) =>
                  setDificultad(v as ConfigExamen["dificultad"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="facil">Solo fáciles</SelectItem>
                  <SelectItem value="media">Solo medias</SelectItem>
                  <SelectItem value="dificil">Solo difíciles</SelectItem>
                  <SelectItem value="mixto">Mixto (aleatorio)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tiempo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Tiempo límite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setTiempoTipo("auto")}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    tiempoTipo === "auto"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 text-slate-700 dark:text-slate-300 dark:border-slate-600"
                  }`}
                >
                  Auto (según preguntas)
                </button>
                <button
                  onClick={() => setTiempoTipo("manual")}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    tiempoTipo === "manual"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 text-slate-700 dark:text-slate-300 dark:border-slate-600"
                  }`}
                >
                  Manual
                </button>
              </div>
              {tiempoTipo === "manual" && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={tiempoManual}
                    onChange={(e) => setTiempoManual(Number(e.target.value))}
                    className="w-24 px-3 py-2 border rounded-md text-sm border-slate-200 dark:border-slate-600 bg-background"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    minutos
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleIniciar}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
          >
            Iniciar examen
          </Button>

          <div className="text-center">
            <button
              onClick={() => router.push("/historial")}
              className="text-sm text-blue-600 hover:underline"
            >
              Ver historial de exámenes
            </button>
          </div>

          <div className="text-center text-xs text-slate-400 mt-4">
            {banco.length} preguntas en el banco
          </div>
        </div>
      </div>
    </div>
  );
}
