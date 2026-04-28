"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExamView } from "@/components/ExamView";
import { cargarSesion } from "@/lib/storage";
import type { SesionExamen } from "@/types/pregunta";

export default function ExamenPage() {
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionExamen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const s = cargarSesion();
    if (!s || s.finalizado) {
      router.replace("/");
      return;
    }
    setSesion(s);
    setCargando(false);
  }, [router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-400 text-sm">Cargando...</div>
      </div>
    );
  }

  if (!sesion) return null;

  return <ExamView sesionInicial={sesion} />;
}
