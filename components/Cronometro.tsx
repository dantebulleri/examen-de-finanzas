"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock } from "lucide-react";
import { formatTiempo, cn } from "@/lib/utils";

interface CronometroProps {
  tiempoLimiteSeg: number;
  inicioTimestamp: number;
  onExpiro: () => void;
}

export function Cronometro({
  tiempoLimiteSeg,
  inicioTimestamp,
  onExpiro,
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

  const porcentaje = restante / tiempoLimiteSeg;
  const critico = porcentaje < 0.15 || restante < 60;
  const advertencia = porcentaje < 0.33 && !critico;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-semibold transition-colors",
        critico
          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 animate-pulse"
          : advertencia
          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
      )}
    >
      <Clock className="w-3.5 h-3.5" />
      {formatTiempo(restante)}
    </div>
  );
}
