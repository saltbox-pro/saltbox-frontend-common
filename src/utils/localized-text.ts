import { AppLanguage } from "../interfaces/locales";

export type LocalizedTextMap = Record<string, string>;

export type LocalizedTextValue = string | LocalizedTextMap | null | undefined;

export function getLanguageCode(language: string | undefined): string {
  return (language ?? "").split("-")[0] || "";
}

function asLocalizedTextMap(value: unknown): LocalizedTextMap | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as LocalizedTextMap;
}

export function getLocalizedText(value: unknown, language: string): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }

  const dict = asLocalizedTextMap(value);
  if (!dict) {
    return "";
  }

  const lang = getLanguageCode(language) || AppLanguage.EN;
  const raw = dict[lang] ?? dict[AppLanguage.EN] ?? Object.values(dict)[0];
  return typeof raw === "string" ? raw.trim() : "";
}

export function setLocalizedTextValue(
  current: unknown,
  language: string,
  value: string
): LocalizedTextMap {
  const lang = getLanguageCode(language) || AppLanguage.EN;
  const currentMap = asLocalizedTextMap(current);
  const next: LocalizedTextMap = currentMap ? { ...currentMap } : {};
  const trimmed = value.trim();

  if (trimmed) {
    next[lang] = trimmed;
  } else {
    delete next[lang];
  }

  return next;
}

export function updateLocalizedTextMap(
  current: unknown,
  language: string,
  value: string
): LocalizedTextMap {
  const lang = getLanguageCode(language) || AppLanguage.EN;
  const currentMap = asLocalizedTextMap(current);
  const next: LocalizedTextMap = currentMap ? { ...currentMap } : {};

  if (value) {
    next[lang] = value;
  } else {
    delete next[lang];
  }

  return next;
}

export function compactLocalizedTextMap(
  value: LocalizedTextMap | null | undefined
): LocalizedTextMap {
  if (value == null) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([language, text]) => {
      if (typeof text !== "string" || !text.trim()) {
        return [];
      }
      return [[language, text]];
    })
  );
}

export function toLocalizedTextFormMap(value: unknown, language?: string): LocalizedTextMap {
  if (value == null) {
    return {};
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return {};
    }
    const lang = getLanguageCode(language) || AppLanguage.EN;
    return { [lang]: trimmed };
  }

  const dict = asLocalizedTextMap(value);
  if (!dict) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(dict).flatMap(([key, text]) => {
      const normalized = typeof text === "string" ? text.trim() : "";
      return normalized ? [[key, normalized]] : [];
    })
  );
}

export function toLocalizedTextPayload(
  value: LocalizedTextMap | null | undefined
): LocalizedTextMap | null {
  if (value == null) {
    return null;
  }

  const next: LocalizedTextMap = {};
  for (const [language, text] of Object.entries(value)) {
    const trimmed = text?.trim() ?? "";
    if (trimmed) {
      next[language] = trimmed;
    }
  }

  return Object.keys(next).length > 0 ? next : null;
}

export function hasLocalizedText(value: LocalizedTextMap | null | undefined): boolean {
  return Object.values(value ?? {}).some((text) => (text?.trim() ?? "").length > 0);
}

export function areLocalizedTextMapsEqual(
  left: LocalizedTextMap | null | undefined,
  right: LocalizedTextMap | null | undefined
): boolean {
  const leftPayload = toLocalizedTextPayload(left) ?? {};
  const rightPayload = toLocalizedTextPayload(right) ?? {};
  const leftKeys = Object.keys(leftPayload);
  const rightKeys = Object.keys(rightPayload);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((language) => leftPayload[language] === rightPayload[language]);
}
