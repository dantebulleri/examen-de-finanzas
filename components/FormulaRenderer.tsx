"use client";

import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface FormulaRendererProps {
  text: string;
  className?: string;
}

export function FormulaRenderer({ text, className }: FormulaRendererProps) {
  const parts = parseLatex(text);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "block") {
          return (
            <span key={i} className="block my-2 overflow-x-auto">
              <BlockMath math={part.content} />
            </span>
          );
        }
        if (part.type === "inline") {
          return (
            <InlineMath key={i} math={part.content} />
          );
        }
        return <span key={i}>{part.content}</span>;
      })}
    </span>
  );
}

type Part = { type: "text" | "inline" | "block"; content: string };

function parseLatex(text: string): Part[] {
  const parts: Part[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const blockIdx = remaining.indexOf("$$");
    const inlineIdx = remaining.indexOf("$");

    if (blockIdx === -1 && inlineIdx === -1) {
      parts.push({ type: "text", content: remaining });
      break;
    }

    if (blockIdx !== -1 && (inlineIdx === -1 || blockIdx <= inlineIdx)) {
      if (blockIdx > 0) {
        parts.push({ type: "text", content: remaining.slice(0, blockIdx) });
      }
      const closeIdx = remaining.indexOf("$$", blockIdx + 2);
      if (closeIdx === -1) {
        parts.push({ type: "text", content: remaining.slice(blockIdx) });
        break;
      }
      parts.push({
        type: "block",
        content: remaining.slice(blockIdx + 2, closeIdx),
      });
      remaining = remaining.slice(closeIdx + 2);
    } else {
      if (inlineIdx > 0) {
        parts.push({ type: "text", content: remaining.slice(0, inlineIdx) });
      }
      const closeIdx = remaining.indexOf("$", inlineIdx + 1);
      if (closeIdx === -1) {
        parts.push({ type: "text", content: remaining.slice(inlineIdx) });
        break;
      }
      parts.push({
        type: "inline",
        content: remaining.slice(inlineIdx + 1, closeIdx),
      });
      remaining = remaining.slice(closeIdx + 1);
    }
  }

  return parts;
}
