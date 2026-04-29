"use client";

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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(total, 10)}, 1fr)`,
        gap: 4,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const id = preguntaIds[i];
        const resp = respuestas[id];
        const respondida =
          resp?.respuesta !== undefined && resp?.respuesta !== null;
        const marcada = resp?.marcadaParaRevisar;
        const activa = i === indiceActual;

        let bg = "var(--bg-2)";
        let color = "var(--fg-3)";
        let border = "1px solid var(--line-soft)";

        if (activa) {
          bg = "var(--accent)";
          color = "var(--accent-fg)";
          border = "none";
        } else if (marcada) {
          bg = "color-mix(in oklch, var(--warn) 18%, transparent)";
          color = "var(--warn)";
          border = "1px solid color-mix(in oklch, var(--warn) 45%, transparent)";
        } else if (respondida) {
          bg = "var(--bg-3)";
          color = "var(--fg-0)";
          border = "1px solid var(--line)";
        }

        return (
          <button
            key={i}
            onClick={() => onNavegar(i)}
            style={{
              aspectRatio: "1",
              borderRadius: 6,
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: activa ? 700 : 500,
              color,
              background: bg,
              border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              transition: "all 150ms ease",
            }}
          >
            {i + 1}
            {marcada && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--warn)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LeyendaNav() {
  return (
    <div
      className="mono"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 14px",
        fontSize: 10,
        color: "var(--fg-3)",
        letterSpacing: "0.04em",
        marginTop: 10,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: "var(--bg-2)",
            border: "1px solid var(--line-soft)",
            display: "inline-block",
          }}
        />
        Sin responder
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: "var(--bg-3)",
            border: "1px solid var(--line)",
            display: "inline-block",
          }}
        />
        Respondida
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: "color-mix(in oklch, var(--warn) 18%, transparent)",
            border: "1px solid color-mix(in oklch, var(--warn) 45%, transparent)",
            display: "inline-block",
          }}
        />
        Marcada
      </span>
    </div>
  );
}
