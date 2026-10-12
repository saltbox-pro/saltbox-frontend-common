import type { FormContextType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";

import { detectLang } from "../../../i18n/detect-lang";
import type { RjsfLanguageSource } from "../types/rjsf-language-source";

import { createAjvErrorLocalizer } from "./ajv-error-localizer";
import { wrapValidatorPreserveDistinctFieldErrors } from "./preserve-distinct-field-errors";

export type { RjsfLanguageSource };

export function createRjsfValidator<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
>(language: RjsfLanguageSource = detectLang) {
  const validator = customizeValidator<T, S, F>({}, createAjvErrorLocalizer(language));
  return wrapValidatorPreserveDistinctFieldErrors(validator);
}

export const rjsfValidator = createRjsfValidator();
