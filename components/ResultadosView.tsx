"use client";

import { useRouter } from "next/navigation";
import { FormulaRenderer } from "@/components/FormulaRenderer";
import { formatTiempo, formatFecha } from "@/lib/utils";
import type { ResultadoExamen } from "@/types/pregunta";

interface ResultadosViewProps {
  resultado: ResultadoExamen;
}

export function ResultadosView({ resultado }: ResultadosViewProps) {
  const router = useRouter();
  const { nota, porcentajeAciertos, tiempoUsadoSeg, preguntas, aciertoPorTema, fecha } = resultado;

  const scoreColor =
    nota >= 7 ? "var(--good)" : nota >= 4 ? "var(--warn)" : "var(--bad)";

  const temasOrdenados = Object.entries(aciertoPorTema).sort(
    (a, b) => a[1].correctas / a[1].total - b[1].correctas / b[1].total
  );

  const correctas = preguntas.filter((p) => p.esCorrecta).length;
  const incorrectas = preguntas.length - correctas;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", padding: "0 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 40, paddingBottom: 80 }}>

        {/* Top label */}
        <div style={{ marginBottom: 24 }}>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em" }}
          >
            RESULTADO — {formatFecha(fecha)}
          </span>
        </div>

        {/* Score strip */}
        <div
          className="card"
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <span
              className="num"
              style={{ fontSize: 52, fontWeight: 800, color: scoreColor, lineHeight: 1 }}
            >
              {nota.toFixed(1)}
            </span>
            <span
              className="mono"
              style={{ fontSize: 16, color: "var(--fg-3)", marginLeft: 4 }}
            >
              /10
            </span>
          </div>

          <div style={{ width: 1, height: 48, background: "var(--line-soft)" }} />

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Kpi label="ACIERTOS" value={`${porcentajeAciertos}%`} />
            <Kpi label="CORRECTAS" value={`${correctas}/${preguntas.length}`} color="var(--good)" />
            <Kpi label="INCORRECTAS" value={`${incorrectas}/${preguntas.length}`} color="var(--bad)" />
            <Kpi label="TIEMPO" value={formatTiempo(tiempoUsadoSeg)} />
          </div>
        </div>

        {/* Topic breakdown (hero) */}
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <span
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--fg-3)",
              letterSpacing: "0.08em",
              display: "block",
              marginBottom: 16,
            }}
          >
            DESGLOSE POR TEMA — PEOR A MEJOR
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {temasOrdenados.map(([tema, { correctas: c, total }]) => {
              const pct = Math.round((c / total) * 100);
              const barColor =
                pct >= 70 ? "var(--good)" : pct >= 40 ? "var(--warn)" : "var(--bad)";
              return (
                <div key={tema}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-1)" }}>
                      {tema}
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: 11, color: barColor, fontWeight: 700 }}
                    >
                      {c}/{total} · {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
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
                        transition: "width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-question detail */}
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 28 }}>
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em" }}
            >
              DETALLE DE RESPUESTAS
            </span>
          </div>

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
              <div
                key={p.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: idx < preguntas.length - 1 ? "1px solid var(--line-soft)" : undefined,
                  display: "flex",
                  gap: 14,
                }}
              >
                {/* Colored left bar */}
                <div
                  style={{
                    width: 3,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: p.esCorrecta ? "var(--good)" : "var(--bad)",
                    alignSelf: "stretch",
                    minHeight: 24,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 5,
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: p.esCorrecta ? "var(--good)" : "var(--bad)",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {p.esCorrecta ? "CORRECTO" : "INCORRECTO"}
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: "var(--fg-3)" }}
                    >
                      #{idx + 1} · {p.tema}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--fg-1)",
                      lineHeight: 1.4,
                      margin: "0 0 8px",
                    }}
                  >
                    <FormulaRenderer text={p.enunciado} />
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: p.esCorrecta ? "var(--good)" : "var(--bad)",
                      }}
                    >
                      Tu resp:{" "}
                      <span style={{ fontWeight: 700 }}>
                        <FormulaRenderer text={respuestaTexto} />
                      </span>
                    </span>
                    {!p.esCorrecta && (
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: "var(--good)" }}
                      >
                        Correcta:{" "}
                        <span style={{ fontWeight: 700 }}>
                          <FormulaRenderer text={correctaTexto} />
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
            style={{ flex: 1, padding: "14px 0", fontSize: 14 }}
          >
            Nuevo examen
          </button>
          <button
            onClick={() => router.push("/historial")}
            className="btn-ghost"
            style={{ padding: "14px 20px", fontSize: 14 }}
          >
            Historial
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="mono"
        style={{ fontSize: 9, color: "var(--fg-3)", letterSpacing: "0.08em", marginBottom: 3 }}
      >
        {label}
      </div>
      <div
        className="num"
        style={{ fontSize: 18, fontWeight: 700, color: color ?? "var(--fg-0)" }}
      >
        {value}
      </div>
    </div>
  );
}
