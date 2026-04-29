"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { seleccionarPreguntas, crearSesion, getTemasUnicos } from "@/lib/exam-utils";
import { guardarSesion, cargarHistorial } from "@/lib/storage";
import type { Pregunta, ConfigExamen, ResultadoExamen } from "@/types/pregunta";

interface ExamSetupProps {
  banco: Pregunta[];
}

const OPCIONES_CANTIDAD = [5, 10, 15, 20];

function calcularAccuracyPorTema(
  historial: ResultadoExamen[]
): Record<string, number> {
  const mapa: Record<string, { c: number; t: number }> = {};
  for (const r of historial) {
    for (const [tema, datos] of Object.entries(r.aciertoPorTema)) {
      if (!mapa[tema]) mapa[tema] = { c: 0, t: 0 };
      mapa[tema].c += datos.correctas;
      mapa[tema].t += datos.total;
    }
  }
  const result: Record<string, number> = {};
  for (const [tema, d] of Object.entries(mapa)) {
    result[tema] = d.t > 0 ? d.c / d.t : -1;
  }
  return result;
}

export function ExamSetup({ banco }: ExamSetupProps) {
  const router = useRouter();
  const temas = useMemo(() => getTemasUnicos(banco), [banco]);

  const [modo, setModo] = useState<"recomendado" | "manual">("recomendado");
  const [cantidad, setCantidad] = useState(10);
  const [temasSeleccionados, setTemasSeleccionados] = useState<string[]>([]);
  const [dificultad, setDificultad] = useState<ConfigExamen["dificultad"]>("todas");
  const [tiempoTipo, setTiempoTipo] = useState<"auto" | "manual">("auto");
  const [tiempoManual, setTiempoManual] = useState(30);
  const [accuracy, setAccuracy] = useState<Record<string, number>>({});
  const [advertencia, setAdvertencia] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sesionesTotal, setSesionesTotal] = useState(0);

  useEffect(() => {
    const historial = cargarHistorial();
    setSesionesTotal(historial.length);
    const acc = calcularAccuracyPorTema(historial);
    setAccuracy(acc);

    if (modo === "recomendado") {
      const flojos = temas.filter((t) => {
        const a = acc[t];
        return a === undefined || a === -1 || a < 0.6;
      });
      setTemasSeleccionados(flojos.length > 0 ? flojos : temas);
    }
  }, [modo, temas]);

  const toggleTema = (tema: string) => {
    if (modo === "recomendado") setModo("manual");
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
      setError(adv ?? "No hay preguntas disponibles con esos filtros.");
      setAdvertencia(null);
      return;
    }
    setError(null);
    setAdvertencia(adv);
    const sesion = crearSesion(config, preguntas);
    guardarSesion(sesion);
    if (adv) {
      setTimeout(() => router.push("/examen"), 1200);
    } else {
      router.push("/examen");
    }
  };

  const accentSoft = "color-mix(in oklch, var(--accent) 40%, transparent)";

  return (
    <div
      className="fx-screen"
      style={{ overflowY: "auto", minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 100px" }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-fg)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M4 17L9 11l4 3 7-8" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>FinExam</span>
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--fg-2)",
                padding: "2px 7px",
                border: "1px solid var(--line-soft)",
                borderRadius: 5,
                letterSpacing: "0.04em",
              }}
            >
              UNR
            </span>
          </div>
          <button
            onClick={() => router.push("/historial")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--fg-2)",
              cursor: "pointer",
              padding: 6,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 17 9 11 13 15 21 6" />
              <polyline points="14 6 21 6 21 13" />
            </svg>
          </button>
        </div>

        {/* Hero */}
        <div style={{ padding: "16px 20px 22px" }}>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Sesión #{String(sesionesTotal + 1).padStart(3, "0")}
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "6px 0 0", letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--fg-0)" }}>
            {modo === "recomendado" ? "Repaso del día" : "Examen personalizado"}
          </h1>
          {modo === "recomendado" && temasSeleccionados.length > 0 && (
            <p style={{ fontSize: 14, color: "var(--fg-2)", margin: "6px 0 0", lineHeight: 1.4 }}>
              Seleccioné los temas con{" "}
              <span style={{ color: "var(--fg-1)", fontWeight: 500 }}>accuracy &lt; 60%</span>
              {" "}para que practiques lo flojo.
            </p>
          )}
        </div>

        {/* Modo toggle */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              display: "flex",
              gap: 3,
              padding: 3,
              background: "var(--bg-1)",
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--line-soft)",
            }}
          >
            {(
              [
                { id: "recomendado" as const, label: "Recomendado" },
                { id: "manual" as const, label: "Manual" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setModo(m.id)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 11,
                  border: "none",
                  background: modo === m.id ? "var(--bg-3)" : "transparent",
                  color: modo === m.id ? "var(--fg-0)" : "var(--fg-2)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 160ms ease",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error / advertencia */}
        {error && (
          <div
            style={{
              margin: "0 20px 16px",
              padding: "12px 14px",
              borderRadius: "var(--r-md)",
              background: "color-mix(in oklch, var(--bad) 12%, transparent)",
              border: "1px solid color-mix(in oklch, var(--bad) 40%, transparent)",
              color: "var(--bad)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        {advertencia && (
          <div
            style={{
              margin: "0 20px 16px",
              padding: "12px 14px",
              borderRadius: "var(--r-md)",
              background: "color-mix(in oklch, var(--warn) 12%, transparent)",
              border: "1px solid color-mix(in oklch, var(--warn) 40%, transparent)",
              color: "var(--warn)",
              fontSize: 13,
            }}
          >
            {advertencia} Iniciando…
          </div>
        )}

        {/* Cantidad */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500 }}>
              Preguntas
            </span>
            <span className="num" style={{ fontSize: 11, color: "var(--fg-3)" }}>
              ≈ {Math.round(cantidad * 2.5)} min
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {OPCIONES_CANTIDAD.map((n) => (
              <button
                key={n}
                onClick={() => setCantidad(n)}
                style={{
                  padding: "14px 0",
                  borderRadius: "var(--r-md)",
                  background: cantidad === n ? "var(--accent-soft)" : "var(--bg-1)",
                  color: cantidad === n ? "var(--accent)" : "var(--fg-1)",
                  border: cantidad === n
                    ? `1px solid ${accentSoft}`
                    : "1px solid var(--line-soft)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  fontSize: 20,
                  cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Temas */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500 }}>
              Temas
            </span>
            <span className="num" style={{ fontSize: 11, color: "var(--fg-3)" }}>
              {temasSeleccionados.length === 0 ? "Todos" : `${temasSeleccionados.length} de ${temas.length}`}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {temas.map((tema) => {
              const acc = accuracy[tema];
              const isOn = temasSeleccionados.includes(tema);
              const hasData = acc !== undefined && acc !== -1;
              const dotColor = !hasData
                ? "var(--fg-3)"
                : acc >= 0.75
                ? "var(--good)"
                : acc >= 0.55
                ? "var(--warn)"
                : "var(--bad)";

              return (
                <button
                  key={tema}
                  onClick={() => toggleTema(tema)}
                  className={`chip ${isOn ? "active" : ""}`}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: dotColor,
                      opacity: isOn ? 1 : 0.7,
                    }}
                  />
                  {tema}
                  {hasData && (
                    <span
                      className="num"
                      style={{
                        fontSize: 10,
                        color: isOn ? "color-mix(in oklch, var(--accent) 70%, var(--fg-3))" : "var(--fg-3)",
                        marginLeft: 2,
                      }}
                    >
                      {Math.round(acc * 100)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {temasSeleccionados.length > 0 && (
            <button
              onClick={() => { setModo("manual"); setTemasSeleccionados([]); }}
              style={{
                marginTop: 10,
                background: "transparent",
                border: "none",
                color: "var(--fg-3)",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Limpiar selección →
            </button>
          )}
        </div>

        {/* Dificultad */}
        <div style={{ padding: "0 20px 20px" }}>
          <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 10 }}>
            Dificultad
          </span>
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              background: "var(--bg-1)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--line-soft)",
            }}
          >
            {(
              [
                { id: "todas" as const, label: "Todas" },
                { id: "facil" as const, label: "Fácil" },
                { id: "media" as const, label: "Media" },
                { id: "dificil" as const, label: "Difícil" },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setDificultad(d.id)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 9,
                  border: "none",
                  background: dificultad === d.id ? "var(--bg-3)" : "transparent",
                  color: dificultad === d.id ? "var(--fg-0)" : "var(--fg-2)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tiempo */}
        <div style={{ padding: "0 20px 20px" }}>
          <span style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 500, display: "block", marginBottom: 10 }}>
            Tiempo límite
          </span>
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              background: "var(--bg-1)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--line-soft)",
              marginBottom: 10,
            }}
          >
            {(
              [
                { id: "auto" as const, label: "Auto (estimado)" },
                { id: "manual" as const, label: "Manual" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTiempoTipo(t.id)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 9,
                  border: "none",
                  background: tiempoTipo === t.id ? "var(--bg-3)" : "transparent",
                  color: tiempoTipo === t.id ? "var(--fg-0)" : "var(--fg-2)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tiempoTipo === "manual" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                min={5}
                max={180}
                value={tiempoManual}
                onChange={(e) => setTiempoManual(Number(e.target.value))}
                style={{
                  width: 80,
                  padding: "8px 12px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line-soft)",
                  background: "var(--bg-1)",
                  color: "var(--fg-0)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                  outline: "none",
                }}
              />
              <span style={{ fontSize: 13, color: "var(--fg-2)" }}>minutos</span>
            </div>
          )}
        </div>

        {/* Info banco */}
        <div style={{ padding: "0 20px" }}>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: "0.04em" }}
          >
            {banco.length} PREGUNTAS EN EL BANCO · {sesionesTotal} SESIONES PREVIAS
          </span>
        </div>
      </div>

      {/* CTA sticky */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px 28px",
          background: "linear-gradient(to top, var(--bg-0) 65%, transparent)",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <button
            className="btn-primary"
            onClick={handleIniciar}
            style={{
              width: "100%",
              padding: "16px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 15,
            }}
          >
            <span>
              Empezar sesión · {cantidad} preguntas
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </button>
          <p
            className="mono"
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "var(--fg-3)",
              margin: "8px 0 0",
              letterSpacing: "0.04em",
            }}
          >
            ENTER ↵
          </p>
        </div>
      </div>
    </div>
  );
}
