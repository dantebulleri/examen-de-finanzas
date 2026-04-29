"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Grid3X3, X } from "lucide-react";
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
  const preguntasIds = preguntas.map((p) => p.id);

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
        [preguntaActual.id]: { ...prev, marcadaParaRevisar: !prev.marcadaParaRevisar },
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
    const resultado = calcularResultados(preguntas, respuestas, tiempoUsadoSeg, tiempoLimiteSeg);
    guardarResultado(resultado);
    borrarSesion();
    router.push(`/resultados?id=${resultado.id}`);
  }, [inicioTimestamp, tiempoLimiteSeg, preguntas, respuestas, router]);

  const handleExpiro = useCallback(() => {
    finalizarExamen();
  }, [finalizarExamen]);

  const marcada = respuestaActual?.marcadaParaRevisar ?? false;
  const esUltima = indicePreguntaActual === preguntas.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--bg-1)",
          borderBottom: "1px solid var(--line-soft)",
          padding: "0 20px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Counter */}
        <span
          className="mono"
          style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "0.04em", flexShrink: 0 }}
        >
          {String(indicePreguntaActual + 1).padStart(2, "0")}
          <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>
            {" / "}
            {String(preguntas.length).padStart(2, "0")}
          </span>
        </span>

        {/* Progress strip */}
        <div style={{ flex: 1, display: "flex", gap: 2, height: 6, borderRadius: 3, overflow: "hidden" }}>
          {preguntas.map((p, i) => {
            const r = respuestas[p.id];
            const respondida = r?.respuesta !== null && r?.respuesta !== undefined;
            const marcadaQ = r?.marcadaParaRevisar;
            const activa = i === indicePreguntaActual;
            const bg = activa
              ? "var(--accent)"
              : marcadaQ
              ? "var(--warn)"
              : respondida
              ? "var(--bg-3)"
              : "var(--line-soft)";
            return (
              <button
                key={p.id}
                onClick={() => handleNavegar(i)}
                style={{
                  flex: 1,
                  height: "100%",
                  background: bg,
                  border: "none",
                  cursor: "pointer",
                  transition: "background 200ms ease",
                  borderRadius: 2,
                }}
              />
            );
          })}
        </div>

        {/* Timer + grid toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Cronometro
            tiempoLimiteSeg={tiempoLimiteSeg}
            inicioTimestamp={inicioTimestamp}
            onExpiro={handleExpiro}
            compact
          />
          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: sidebarAbierto ? "var(--bg-3)" : "transparent",
              border: "1px solid var(--line-soft)",
              color: "var(--fg-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Grid3X3 size={14} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "0 20px", display: "flex", gap: 20 }}>
        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, paddingTop: 28, paddingBottom: 100 }}>
          {/* Card */}
          <div
            className="card"
            style={{ padding: "28px 28px 24px", marginBottom: 16 }}
          >
            <PreguntaCard
              pregunta={preguntaActual}
              respuesta={respuestaActual?.respuesta ?? null}
              onRespuesta={handleRespuesta}
            />
          </div>

          {/* Actions row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              padding: "0 2px",
            }}
          >
            <button
              onClick={handleMarcada}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 6,
                border: marcada
                  ? `1px solid color-mix(in oklch, var(--warn) 50%, transparent)`
                  : "1px solid transparent",
                background: marcada
                  ? `color-mix(in oklch, var(--warn) 12%, transparent)`
                  : "transparent",
                color: marcada ? "var(--warn)" : "var(--fg-3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 160ms ease",
              }}
            >
              {marcada ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {marcada ? "Marcada" : "Marcar para revisar"}
            </button>

            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.04em" }}
            >
              {preguntaActual.fuente}
            </span>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => handleNavegar(indicePreguntaActual - 1)}
              disabled={indicePreguntaActual === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 18px",
                borderRadius: "var(--r-md)",
                background: "var(--bg-2)",
                border: "1px solid var(--line-soft)",
                color: indicePreguntaActual === 0 ? "var(--fg-3)" : "var(--fg-1)",
                fontSize: 13,
                fontWeight: 600,
                cursor: indicePreguntaActual === 0 ? "default" : "pointer",
                opacity: indicePreguntaActual === 0 ? 0.4 : 1,
                transition: "all 160ms ease",
              }}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            {!esUltima ? (
              <button
                onClick={() => handleNavegar(indicePreguntaActual + 1)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 18px",
                  borderRadius: "var(--r-md)",
                  background: "var(--accent)",
                  border: "none",
                  color: "var(--accent-fg)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "opacity 160ms ease",
                }}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setConfirmarFinalizar(true)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 18px",
                  borderRadius: "var(--r-md)",
                  background: "var(--good)",
                  border: "none",
                  color: "oklch(0.16 0.05 155)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "opacity 160ms ease",
                }}
              >
                Finalizar examen
              </button>
            )}
          </div>
        </main>

        {/* Sidebar desktop */}
        {sidebarAbierto && (
          <aside
            className="hidden-mobile"
            style={{
              width: 220,
              flexShrink: 0,
              paddingTop: 28,
            }}
          >
            <div
              className="card"
              style={{ padding: 16, position: "sticky", top: 72 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.06em" }}
                >
                  PREGUNTAS
                </span>
                <button
                  onClick={() => setSidebarAbierto(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--fg-3)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={12} />
                </button>
              </div>
              <NavPreguntas
                total={preguntas.length}
                indiceActual={indicePreguntaActual}
                respuestas={respuestas}
                preguntaIds={preguntasIds}
                onNavegar={handleNavegar}
              />
              <LeyendaNav />
              <button
                onClick={() => setConfirmarFinalizar(true)}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "10px 0",
                  borderRadius: "var(--r-md)",
                  background: "var(--good)",
                  border: "none",
                  color: "oklch(0.16 0.05 155)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Finalizar
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {sidebarAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.55)",
          }}
          onClick={() => setSidebarAbierto(false)}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "var(--bg-1)",
              borderTop: "1px solid var(--line-soft)",
              borderRadius: "16px 16px 0 0",
              padding: 20,
              maxHeight: "65vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.06em" }}
              >
                PREGUNTAS — {totalRespondidas}/{preguntas.length} respondidas
              </span>
              <button
                onClick={() => setSidebarAbierto(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--fg-2)",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <NavPreguntas
              total={preguntas.length}
              indiceActual={indicePreguntaActual}
              respuestas={respuestas}
              preguntaIds={preguntasIds}
              onNavegar={handleNavegar}
            />
            <LeyendaNav />
            <button
              onClick={() => setConfirmarFinalizar(true)}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "14px 0",
                borderRadius: "var(--r-md)",
                background: "var(--good)",
                border: "none",
                color: "oklch(0.16 0.05 155)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Finalizar examen
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirmarFinalizar} onOpenChange={setConfirmarFinalizar}>
        <DialogContent
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--line-soft)",
            borderRadius: "var(--r-lg)",
            color: "var(--fg-0)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--fg-0)" }}>¿Finalizar el examen?</DialogTitle>
            <DialogDescription style={{ color: "var(--fg-2)" }}>
              Respondiste {totalRespondidas} de {preguntas.length} preguntas.
              {totalRespondidas < preguntas.length && (
                <span style={{ display: "block", marginTop: 6, color: "var(--warn)" }}>
                  Tenés {preguntas.length - totalRespondidas} pregunta
                  {preguntas.length - totalRespondidas !== 1 ? "s" : ""} sin responder.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ gap: 8 }}>
            <button
              onClick={() => setConfirmarFinalizar(false)}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--r-md)",
                background: "var(--bg-2)",
                border: "1px solid var(--line-soft)",
                color: "var(--fg-1)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Seguir respondiendo
            </button>
            <button
              onClick={finalizarExamen}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--r-md)",
                background: "var(--good)",
                border: "none",
                color: "oklch(0.16 0.05 155)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sí, finalizar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
