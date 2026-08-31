import type { PluginLocalizedLabel } from "./types";

export function resolvePluginLocalizedLabel(
  label: PluginLocalizedLabel,
  language: string,
  fallbackKey: string
): string {
  if (typeof label === "string") {
    return label;
  }

  return label[language as keyof typeof label] || label.en || fallbackKey;
}
