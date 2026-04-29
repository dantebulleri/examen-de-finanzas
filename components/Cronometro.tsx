"use client";

import { useEffect, useState, useCallback } from "react";
import { formatTiempo } from "@/lib/utils";

interface CronometroProps {
  tiempoLimiteSeg: number;
  inicioTimestamp: number;
  onExpiro: () => void;
  /** Si es true muestra el anillo completo (variante compacta de header) */
  compact?: boolean;
}

export function Cronometro({
  tiempoLimiteSeg,
  inicioTimestamp,
  onExpiro,
  compact = false,
}: CronometroProps) {
  const calcularRestante = useCallback(() => {
    const transcurrido = Math.floor((Date.now() - inicioTimestamp) / 1000);
    return Math.max(0, tiempoLimiteSeg - transcurrido);
  }, [inicioTimestamp, tiempoLimiteSeg]);

  const [restante, setRestante] = useState(calcularRestante);
  const [haExpirado, setHaExpirado] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const nuevo = calcularRestante();
      setRestante(nuevo);
      if (nuevo === 0 && !haExpirado) {
        setHaExpirado(true);
        onExpiro();
      }
    }, 500);
    return () => clearInterval(intervalo);
  }, [calcularRestante, haExpirado, onExpiro]);

  const pct = restante / tiempoLimiteSeg;
  const critico = pct < 0.15 || restante < 60;
  const advertencia = pct < 0.33 && !critico;

  const ringColor = critico
    ? "var(--bad)"
    : advertencia
    ? "var(--warn)"
    : "var(--accent)";

  /* Radial timer compacto (usado en la pantalla de examen) */
  if (compact) {
    const r = 15;
    const circum = 2 * Math.PI * r; // ≈ 94.25
    return (
      <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="var(--line-soft)"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${pct * circum} ${circum}`}
            style={{
              transition: "stroke-dasharray 800ms linear, stroke 300ms ease",
              animation: critico ? "fx-pulse 1s ease infinite" : undefined,
            }}
          />
        </svg>
        <span
          className="mono"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 600,
            color: critico ? "var(--bad)" : "var(--fg-1)",
          }}
        >
          {String(Math.floor(restante / 60)).padStart(2, "0")}
        </span>
      </div>
    );
  }

  /* Versión texto para usos donde no hay restricción de espacio */
  return (
    <div
      className="mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        color: critico ? "var(--bad)" : advertencia ? "var(--warn)" : "var(--fg-1)",
        animation: critico ? "fx-pulse 1s ease infinite" : undefined,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {formatTiempo(restante)}
    </div>
  );
}
