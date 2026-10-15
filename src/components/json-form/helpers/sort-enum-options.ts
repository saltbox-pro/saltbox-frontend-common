import type { EnumOptionsType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils";

import { AppLanguage } from "../../../interfaces/locales";

function toCollatorLocale(language: string): string {
  return language.split("-")[0] || AppLanguage.EN;
}

export function sortEnumOptionsByLabel<S extends StrictRJSFSchema = RJSFSchema>(
  enumOptions: EnumOptionsType<S>[] | undefined,
  language: string
): EnumOptionsType<S>[] | undefined {
  if (!Array.isArray(enumOptions) || enumOptions.length <= 1) {
    return enumOptions;
  }

  const collator = new Intl.Collator(toCollatorLocale(language), {
    sensitivity: "base",
    numeric: true,
  });

  return [...enumOptions].sort((left, right) => collator.compare(left.label, right.label));
}
