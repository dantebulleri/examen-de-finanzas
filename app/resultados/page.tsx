"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResultadosView } from "@/components/ResultadosView";
import { cargarHistorial } from "@/lib/storage";
import type { ResultadoExamen } from "@/types/pregunta";

function ResultadosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [resultado, setResultado] = useState<ResultadoExamen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) {
      router.replace("/");
      return;
    }
    const historial = cargarHistorial();
    const r = historial.find((x) => x.id === id);
    if (!r) {
      router.replace("/");
      return;
    }
    setResultado(r);
    setCargando(false);
  }, [id, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-400 text-sm">Cargando resultados...</div>
      </div>
    );
  }

  if (!resultado) return null;

  return <ResultadosView resultado={resultado} />;
}

export default function ResultadosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-slate-400 text-sm">Cargando...</div>
        </div>
      }
    >
      <ResultadosContent />
    </Suspense>
  );
}
