import type { StatusSegmentInput } from "../types/status";

export function getStatusSegmentColors(
  total: number,
  segments: readonly StatusSegmentInput[],
  emptyColor: string
): string | Record<string, string> {
  if (total <= 0) return emptyColor;

  const parts = segments.filter((segment) => segment.count > 0);
  if (parts.length === 0) return emptyColor;
  if (parts.length === 1) return parts[0].color;

  const stops: Record<string, string> = {};
  let acc = 0;
  const epsilon = 0.02;

  for (const part of parts) {
    const start = acc;
    acc += (part.count / total) * 100;
    const end = Math.min(100, Math.max(0, acc));

    stops[`${start.toFixed(2)}%`] = part.color;
    stops[`${Math.max(start, end - epsilon).toFixed(2)}%`] = part.color;
  }

  stops["100%"] = parts[parts.length - 1].color;
  return stops;
}
