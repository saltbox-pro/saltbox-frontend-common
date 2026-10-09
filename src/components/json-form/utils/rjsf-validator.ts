import type { FormContextType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";

import { detectLang } from "../../../i18n/detect-lang";
import type { RjsfLanguageSource } from "../types/rjsf-language-source";

import { createAjvErrorLocalizer } from "./ajv-error-localizer";

export type { RjsfLanguageSource };

export function createRjsfValidator<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
>(language: RjsfLanguageSource = detectLang) {
  return customizeValidator<T, S, F>({}, createAjvErrorLocalizer(language));
}

export const rjsfValidator = createRjsfValidator();
