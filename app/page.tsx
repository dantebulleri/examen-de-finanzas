import { ExamSetup } from "@/components/ExamSetup";
import bancoData from "@/data/banco-preguntas.json";
import type { Pregunta } from "@/types/pregunta";

export default function HomePage() {
  const banco = bancoData as Pregunta[];
  return <ExamSetup banco={banco} />;
}
