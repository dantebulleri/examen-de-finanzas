"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const datosGrafico = historial.map((r, i) => ({
    n: i + 1,
    nota: r.nota,
    pct: r.porcentajeAciertos,
  }));

  const promedio =
    historial.length > 0
      ? historial.reduce((acc, r) => acc + r.nota, 0) / historial.length
      : null;

  const mejor = historial.length > 0
    ? Math.max(...historial.map((r) => r.nota))
    : null;

  const tendencia = historial.length >= 2
    ? historial[historial.length - 1].nota - historial[historial.length - 2].nota
    : null;

  const aciertoPorTema = calcularAciertosPorTema(historial);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", padding: "0 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 40, paddingBottom: 80 }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--fg-0)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Historial
            </h1>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.04em" }}
            >
              {historial.length} sesión{historial.length !== 1 ? "es" : ""} registrada{historial.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {historial.length > 0 && (
              <button
                onClick={() => setConfirmarBorrar(true)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--r-md)",
                  background: "transparent",
                  border: `1px solid color-mix(in oklch, var(--bad) 40%, transparent)`,
                  color: "var(--bad)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Borrar todo
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: 12 }}
            >
              Nuevo examen
            </button>
          </div>
        </div>

        {historial.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* KPI strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <KpiCard
                label="PROMEDIO"
                value={promedio !== null ? promedio.toFixed(2) : "—"}
                sub="/10"
                color={
                  promedio === null ? undefined
                    : promedio >= 7 ? "var(--good)"
                    : promedio >= 4 ? "var(--warn)"
                    : "var(--bad)"
                }
              />
              <KpiCard
                label="MEJOR NOTA"
                value={mejor !== null ? mejor.toFixed(1) : "—"}
                sub="/10"
                color="var(--good)"
              />
              <KpiCard
                label="TENDENCIA"
                value={
                  tendencia === null
                    ? "—"
                    : tendencia > 0
                    ? `+${tendencia.toFixed(1)}`
                    : tendencia.toFixed(1)
                }
                sub="último vs anterior"
                color={
                  tendencia === null ? undefined
                    : tendencia > 0 ? "var(--good)"
                    : tendencia < 0 ? "var(--bad)"
                    : "var(--fg-2)"
                }
              />
            </div>

            {/* Line chart */}
            <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-3)",
                  letterSpacing: "0.08em",
                  display: "block",
                  marginBottom: 14,
                }}
              >
                EVOLUCIÓN DE NOTAS
              </span>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart
                  data={datosGrafico}
                  margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="gradAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.78 0.18 155)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="oklch(0.78 0.18 155)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--line-soft)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="n"
                    tick={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Sesión",
                      position: "insideBottom",
                      offset: -2,
                      fontSize: 9,
                      fill: "var(--fg-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 4, 7, 10]}
                    tick={{ fontSize: 10, fill: "var(--fg-3)", fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine
                    y={7}
                    stroke="var(--good)"
                    strokeDasharray="4 3"
                    strokeOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-1)",
                      border: "1px solid var(--line-soft)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--fg-0)",
                    }}
                    formatter={(value) => {
                      const n = typeof value === "number" ? value : parseFloat(String(value));
                      return [`${n.toFixed(1)}/10`, "Nota"];
                    }}
                    labelFormatter={(label) => `Sesión #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="nota"
                    stroke="oklch(0.78 0.18 155)"
                    strokeWidth={2}
                    fill="url(#gradAccent)"
                    dot={{ r: 4, fill: "oklch(0.78 0.18 155)", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "oklch(0.78 0.18 155)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Topic breakdown */}
            {aciertoPorTema.length > 0 && (
              <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--fg-3)",
                    letterSpacing: "0.08em",
                    display: "block",
                    marginBottom: 14,
                  }}
                >
                  ACIERTOS POR TEMA — PEOR A MEJOR
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {aciertoPorTema.map(({ tema, correctas, total }) => {
                    const pct = Math.round((correctas / total) * 100);
                    const barColor =
                      pct >= 70 ? "var(--good)" : pct >= 40 ? "var(--warn)" : "var(--bad)";
                    return (
                      <div key={tema}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 12, color: "var(--fg-1)", fontWeight: 500 }}>
                            {tema}
                          </span>
                          <span
                            className="mono"
                            style={{ fontSize: 11, color: barColor, fontWeight: 700 }}
                          >
                            {correctas}/{total} · {pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "var(--bg-2)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: barColor,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Session list */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "14px 20px 10px",
                  borderBottom: "1px solid var(--line-soft)",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em" }}
                >
                  SESIONES RECIENTES
                </span>
              </div>

              {[...historial].reverse().map((r, i) => {
                const notaColor =
                  r.nota >= 7 ? "var(--good)" : r.nota >= 4 ? "var(--warn)" : "var(--bad)";
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderBottom:
                        i < historial.length - 1 ? "1px solid var(--line-soft)" : undefined,
                    }}
                  >
                    {/* Left color bar */}
                    <div
                      style={{
                        width: 3,
                        height: 36,
                        borderRadius: 2,
                        background: notaColor,
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--fg-0)",
                          marginBottom: 2,
                        }}
                      >
                        {formatFecha(r.fecha)}
                      </div>
                      <span
                        className="mono"
                        style={{ fontSize: 10, color: "var(--fg-3)" }}
                      >
                        {r.preguntas.length} preguntas · {formatTiempo(r.tiempoUsadoSeg)} · {r.porcentajeAciertos}% aciertos
                      </span>
                    </div>

                    <div
                      className="num"
                      style={{ fontSize: 20, fontWeight: 800, color: notaColor, flexShrink: 0 }}
                    >
                      {r.nota.toFixed(1)}
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: "var(--fg-3)", fontWeight: 400 }}
                      >
                        /10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirm delete dialog */}
      <Dialog open={confirmarBorrar} onOpenChange={setConfirmarBorrar}>
        <DialogContent
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--line-soft)",
            borderRadius: "var(--r-lg)",
            color: "var(--fg-0)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--fg-0)" }}>¿Borrar todo el historial?</DialogTitle>
            <DialogDescription style={{ color: "var(--fg-2)" }}>
              Esta acción no se puede deshacer. Se eliminarán los {historial.length} exámenes guardados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ gap: 8 }}>
            <button
              onClick={() => setConfirmarBorrar(false)}
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
              Cancelar
            </button>
            <button
              onClick={handleBorrar}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--r-md)",
                background: "var(--bad)",
                border: "none",
                color: "oklch(0.97 0.005 250)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sí, borrar todo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        color: "var(--fg-3)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "var(--bg-2)",
          border: "1px solid var(--line-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 24,
        }}
      >
        📊
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-1)", margin: "0 0 6px" }}>
        Todavía no rendiste ningún examen
      </p>
      <p style={{ fontSize: 13, color: "var(--fg-3)", margin: "0 0 24px" }}>
        Tus resultados y estadísticas van a aparecer acá
      </p>
      <button
        onClick={() => router.push("/")}
        className="btn-primary"
        style={{ padding: "12px 24px", fontSize: 14 }}
      >
        Empezar ahora
      </button>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: "14px 16px" }}
    >
      <div
        className="mono"
        style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: "0.08em", marginBottom: 6 }}
      >
        {label}
      </div>
      <div
        className="num"
        style={{ fontSize: 22, fontWeight: 800, color: color ?? "var(--fg-0)", lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="mono"
          style={{ fontSize: 9, color: "var(--fg-3)", marginTop: 3 }}
        >
          {sub}
        </div>
      )}
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
