# FinExam UNR

Aplicación web para practicar exámenes de Finanzas — Licenciatura en Economía, UNR.

## Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Agregar preguntas al banco

Editá el archivo `/data/banco-preguntas.json`. Cada pregunta respeta este esquema:

```json
{
  "id": "p011",
  "tema": "Valuación de Opciones",
  "unidad": 8,
  "dificultad": "media",
  "fuente": "Brealey, Myers & Allen - Cap. 20",
  "tipo": "multiple_choice",
  "enunciado": "¿Cuál es la fórmula de paridad put-call? $C - P = S - K \\cdot e^{-rT}$",
  "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
  "respuesta_correcta": 0,
  "explicacion": "Texto que explica la respuesta correcta.",
  "tiempo_estimado_min": 3
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único (ej: `"p011"`) |
| `tema` | `string` | Tema de la pregunta (aparece en los filtros) |
| `unidad` | `number` | Número de unidad del programa |
| `dificultad` | `"facil"` \| `"media"` \| `"dificil"` | Nivel de dificultad |
| `fuente` | `string` | Referencia bibliográfica |
| `tipo` | `"multiple_choice"` \| `"numeric"` \| `"verdadero_falso"` | Tipo de pregunta |
| `enunciado` | `string` | Texto del enunciado. Usá `$...$` para LaTeX inline y `$$...$$` para display |
| `opciones` | `string[]` | Solo para `multiple_choice`. Las opciones de respuesta |
| `respuesta_correcta` | `number` \| `boolean` | Para `multiple_choice`: índice 0-based de la opción correcta. Para `verdadero_falso`: `true` o `false`. Para `numeric`: el valor numérico correcto |
| `tolerancia` | `number` | Solo para `numeric`. Porcentaje de tolerancia (ej: `5` = ±5%) |
| `explicacion` | `string` | Explicación de la respuesta correcta (se puede agregar a resultados después) |
| `tiempo_estimado_min` | `number` | Minutos estimados para resolver la pregunta |

### LaTeX en enunciados y opciones

- **Inline**: `$E(R_i) = R_f + \beta_i \cdot [E(R_m) - R_f]$`
- **Display**: `$$VAN = \sum_{t=1}^{n} \frac{FC_t}{(1+k)^t} - I_0$$`

## Deploy a Vercel

1. Subí el repositorio a GitHub.
2. Entrá a [vercel.com](https://vercel.com) e importá el repo.
3. Vercel detecta Next.js automáticamente — hacé clic en **Deploy**.

No hay variables de entorno requeridas. Todo el estado se guarda en localStorage del navegador del usuario.

## Estructura del proyecto

```
/app
  /examen        → Pantalla de examen
  /resultados    → Resultados del examen
  /historial     → Historial de exámenes rendidos
/components
  /ui            → Componentes base (Button, Card, Dialog, etc.)
  ExamSetup      → Configuración inicial del examen
  ExamView       → Pantalla de examen con cronómetro y navegación
  ResultadosView → Pantalla de resultados
  HistorialView  → Historial con gráfico de evolución
  PreguntaCard   → Renderizado de cada pregunta (MC, numérico, V/F)
  Cronometro     → Cronómetro regresivo persistente
  FormulaRenderer → Renderizado de fórmulas LaTeX con KaTeX
  NavPreguntas   → Grid de navegación entre preguntas
/data
  banco-preguntas.json → Banco de preguntas
/lib
  exam-utils.ts  → Lógica de filtrado, selección y cálculo de resultados
  storage.ts     → Lectura/escritura en localStorage y sessionStorage
  utils.ts       → Utilidades generales (cn, formatTiempo, formatFecha)
/types
  pregunta.ts    → Tipos TypeScript exportados
```
