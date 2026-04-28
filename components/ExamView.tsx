"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  PanelRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cronometro } from "@/components/Cronometro";
import { PreguntaCard } from "@/components/PreguntaCard";
import { NavPreguntas, LeyendaNav } from "@/components/NavPreguntas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calcularResultados } from "@/lib/exam-utils";
import { guardarSesion, guardarResultado, borrarSesion } from "@/lib/storage";
import type { SesionExamen, RespuestaUsuario } from "@/types/pregunta";

interface ExamViewProps {
  sesionInicial: SesionExamen;
}

export function ExamView({ sesionInicial }: ExamViewProps) {
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionExamen>(sesionInicial);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(false);

  const { preguntas, respuestas, indicePreguntaActual, inicioTimestamp, tiempoLimiteSeg } = sesion;
  const preguntaActual = preguntas[indicePreguntaActual];
  const respuestaActual = respuestas[preguntaActual.id];

  const totalRespondidas = Object.values(respuestas).filter(
    (r) => r.respuesta !== null && r.respuesta !== undefined
  ).length;

  const actualizarSesion = (nuevaSesion: SesionExamen) => {
    setSesion(nuevaSesion);
    guardarSesion(nuevaSesion);
  };

  const handleRespuesta = (valor: number | boolean | null) => {
    const nuevaRespuesta: RespuestaUsuario = {
      preguntaId: preguntaActual.id,
      respuesta: valor,
      marcadaParaRevisar: respuestaActual?.marcadaParaRevisar ?? false,
    };
    actualizarSesion({
      ...sesion,
      respuestas: { ...respuestas, [preguntaActual.id]: nuevaRespuesta },
    });
  };

  const handleMarcada = () => {
    const prev = respuestaActual ?? {
      preguntaId: preguntaActual.id,
      respuesta: null,
      marcadaParaRevisar: false,
    };
    actualizarSesion({
      ...sesion,
      respuestas: {
        ...respuestas,
        [preguntaActual.id]: {
          ...prev,
          marcadaParaRevisar: !prev.marcadaParaRevisar,
        },
      },
    });
  };

  const handleNavegar = (indice: number) => {
    actualizarSesion({ ...sesion, indicePreguntaActual: indice });
    setSidebarAbierto(false);
  };

  const finalizarExamen = useCallback(() => {
    const tiempoUsadoSeg = Math.min(
      Math.floor((Date.now() - inicioTimestamp) / 1000),
      tiempoLimiteSeg
    );
    const resultado = calcularResultados(
      preguntas,
      respuestas,
      tiempoUsadoSeg,
      tiempoLimiteSeg
    );
    guardarResultado(resultado);
    borrarSesion();
    router.push(`/resultados?id=${resultado.id}`);
  }, [inicioTimestamp, tiempoLimiteSeg, preguntas, respuestas, router]);

  const handleExpiro = useCallback(() => {
    finalizarExamen();
  }, [finalizarExamen]);

  const marcada = respuestaActual?.marcadaParaRevisar ?? false;
  const preguntasIds = preguntas.map((p) => p.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {indicePreguntaActual + 1}
              <span className="text-slate-400 font-normal">
                /{preguntas.length}
              </span>
            </span>
          </div>

          <div className="flex-1 max-w-xs">
            <Progress
              value={(totalRespondidas / preguntas.length) * 100}
              className="h-2"
            />
            <p className="text-xs text-center text-slate-400 mt-0.5">
              {totalRespondidas}/{preguntas.length} respondidas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Cronometro
              tiempoLimiteSeg={tiempoLimiteSeg}
              inicioTimestamp={inicioTimestamp}
              onExpiro={handleExpiro}
            />
            <button
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 flex gap-4">
        {/* Contenido principal */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
            <PreguntaCard
              pregunta={preguntaActual}
              respuesta={respuestaActual?.respuesta ?? null}
              onRespuesta={handleRespuesta}
            />
          </div>

          {/* Acciones por pregunta */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleMarcada}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
                marcada
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400"
              }`}
            >
              {marcada ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {marcada ? "Marcada" : "Marcar para revisar"}
            </button>

            <span className="text-xs text-slate-400">
              Fuente: {preguntaActual.fuente}
            </span>
          </div>

          {/* Navegación */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleNavegar(indicePreguntaActual - 1)}
              disabled={indicePreguntaActual === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {indicePreguntaActual < preguntas.length - 1 ? (
              <Button
                onClick={() => handleNavegar(indicePreguntaActual + 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmarFinalizar(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Finalizar
              </Button>
            )}
          </div>
        </main>

        {/* Sidebar desktop */}
        {sidebarAbierto && (
          <aside className="hidden sm:block w-56 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sticky top-20">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Preguntas
              </h3>
              <NavPreguntas
                total={preguntas.length}
                indiceActual={indicePreguntaActual}
                respuestas={respuestas}
                preguntaIds={preguntasIds}
                onNavegar={handleNavegar}
              />
              <LeyendaNav />
              <Button
                onClick={() => setConfirmarFinalizar(true)}
                size="sm"
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Finalizar
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Sidebar móvil */}
      {sidebarAbierto && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarAbierto(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Preguntas
            </h3>
            <NavPreguntas
              total={preguntas.length}
              indiceActual={indicePreguntaActual}
              respuestas={respuestas}
              preguntaIds={preguntasIds}
              onNavegar={handleNavegar}
            />
            <LeyendaNav />
            <Button
              onClick={() => setConfirmarFinalizar(true)}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              Finalizar examen
            </Button>
          </div>
        </div>
      )}

      {/* Dialog confirmar finalizar */}
      <Dialog open={confirmarFinalizar} onOpenChange={setConfirmarFinalizar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Finalizar el examen?</DialogTitle>
            <DialogDescription>
              Respondiste {totalRespondidas} de {preguntas.length} preguntas.
              {totalRespondidas < preguntas.length && (
                <span className="block mt-1 text-yellow-600 dark:text-yellow-400">
                  Tenés {preguntas.length - totalRespondidas} pregunta
                  {preguntas.length - totalRespondidas !== 1 ? "s" : ""} sin responder.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmarFinalizar(false)}
            >
              Seguir respondiendo
            </Button>
            <Button
              onClick={finalizarExamen}
              className="bg-green-600 hover:bg-green-700"
            >
              Sí, finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
