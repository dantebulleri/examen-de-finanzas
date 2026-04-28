import type { ResultadoExamen, SesionExamen } from "@/types/pregunta";

const HISTORIAL_KEY = "finexam_historial";
const SESION_KEY = "finexam_sesion";

export function guardarResultado(resultado: ResultadoExamen): void {
  if (typeof window === "undefined") return;
  const historial = cargarHistorial();
  historial.push(resultado);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
}

export function cargarHistorial(): ResultadoExamen[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORIAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ResultadoExamen[];
  } catch {
    return [];
  }
}

export function borrarHistorial(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORIAL_KEY);
}

export function guardarSesion(sesion: SesionExamen): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESION_KEY, JSON.stringify(sesion));
}

export function cargarSesion(): SesionExamen | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SesionExamen;
  } catch {
    return null;
  }
}

export function borrarSesion(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESION_KEY);
}
