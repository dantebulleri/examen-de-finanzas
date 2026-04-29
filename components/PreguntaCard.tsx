"use client";

import { useState } from "react";
import { FormulaRenderer } from "@/components/FormulaRenderer";
import { parsearRespuestaNumeric } from "@/lib/exam-utils";
import type { Pregunta } from "@/types/pregunta";

interface PreguntaCardProps {
  pregunta: Pregunta;
  respuesta: number | boolean | null;
  onRespuesta: (valor: number | boolean | null) => void;
}

const DIFICULTAD_COLOR: Record<string, string> = {
  facil:   "var(--good)",
  media:   "var(--warn)",
  dificil: "var(--bad)",
};
const DIFICULTAD_LABEL: Record<string, string> = {
  facil: "Fácil", media: "Media", dificil: "Difícil",
};
const TIPO_LABEL: Record<string, string> = {
  multiple_choice: "Opción múltiple",
  numeric: "Numérico",
  verdadero_falso: "V / F",
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

  const difColor = DIFICULTAD_COLOR[pregunta.dificultad];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Meta strip */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            borderRadius: 999,
            border: `1px solid color-mix(in oklch, ${difColor} 40%, transparent)`,
            background: `color-mix(in oklch, ${difColor} 12%, transparent)`,
            color: difColor,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: difColor,
            }}
          />
          {DIFICULTAD_LABEL[pregunta.dificultad].toUpperCase()}
        </span>

        <span className="chip" style={{ pointerEvents: "none", cursor: "default" }}>
          {pregunta.tema}
        </span>

        <span
          className="mono"
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--fg-3)",
            letterSpacing: "0.04em",
          }}
        >
          {TIPO_LABEL[pregunta.tipo]} · ~{pregunta.tiempo_estimado_min} min
        </span>
      </div>

      {/* Enunciado */}
      <p
        style={{
          fontSize: 19,
          lineHeight: 1.45,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          margin: 0,
          color: "var(--fg-0)",
        }}
      >
        <FormulaRenderer text={pregunta.enunciado} />
      </p>

      {/* Opciones: multiple_choice */}
      {pregunta.tipo === "multiple_choice" && pregunta.opciones && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pregunta.opciones.map((opcion, idx) => {
            const isPicked = respuesta === idx;
            return (
              <button
                key={idx}
                onClick={() => onRespuesta(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: "var(--r-md)",
                  background: isPicked ? "var(--accent-soft)" : "var(--bg-1)",
                  border: isPicked
                    ? "1px solid color-mix(in oklch, var(--accent) 50%, transparent)"
                    : "1px solid var(--line-soft)",
                  color: "var(--fg-0)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 160ms ease",
                }}
              >
                <span
                  className="mono"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isPicked ? "var(--accent)" : "var(--bg-3)",
                    color: isPicked ? "var(--accent-fg)" : "var(--fg-2)",
                    fontSize: 11,
                    fontWeight: 600,
                    flexShrink: 0,
                    transition: "all 160ms ease",
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>
                  <FormulaRenderer text={opcion} />
                </span>
                {isPicked && (
                  <span
                    className="mono"
                    style={{ fontSize: 11, color: "var(--accent)", opacity: 0.7 }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Opciones: verdadero_falso */}
      {pregunta.tipo === "verdadero_falso" && (
        <div style={{ display: "flex", gap: 10 }}>
          {[true, false].map((val) => {
            const isPicked = respuesta === val;
            return (
              <button
                key={String(val)}
                onClick={() => onRespuesta(val)}
                style={{
                  flex: 1,
                  padding: "16px 0",
                  borderRadius: "var(--r-md)",
                  background: isPicked ? "var(--accent-soft)" : "var(--bg-1)",
                  border: isPicked
                    ? "1px solid color-mix(in oklch, var(--accent) 50%, transparent)"
                    : "1px solid var(--line-soft)",
                  color: isPicked ? "var(--accent)" : "var(--fg-1)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 160ms ease",
                }}
              >
                {val ? "Verdadero" : "Falso"}
              </button>
            );
          })}
        </div>
      )}

      {/* Input: numeric */}
      {pregunta.tipo === "numeric" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label
            className="mono"
            style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.06em" }}
          >
            RESPUESTA · PUNTO O COMA COMO DECIMAL
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={inputNumerico}
            onChange={(e) => handleNumericoChange(e.target.value)}
            placeholder="Ej: 1234,56"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "var(--r-md)",
              border: inputNumerico
                ? "1px solid color-mix(in oklch, var(--accent) 50%, transparent)"
                : "1px solid var(--line-soft)",
              background: "var(--bg-1)",
              color: "var(--fg-0)",
              fontSize: 20,
              fontFamily: "var(--font-mono)",
              outline: "none",
              transition: "border 160ms ease",
            }}
          />
          {pregunta.tolerancia && (
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.04em" }}
            >
              TOLERANCIA ±{pregunta.tolerancia}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
