import type { ReactNode } from "react";

export function isEmptyDisplayValue(value: ReactNode): boolean {
  return value == null || value === false || (typeof value === "string" && value.trim() === "");
}
