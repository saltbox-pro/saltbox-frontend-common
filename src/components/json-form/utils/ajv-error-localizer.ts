import type { Localizer } from "@rjsf/validator-ajv8";
import type { ErrorObject } from "ajv";
import localizeEn from "ajv-i18n/localize/en";
import localizeRu from "ajv-i18n/localize/ru";

import { AppLanguage } from "../../../interfaces/locales";
import type { RjsfLanguageSource } from "../types/rjsf-language-source";

import { AJV_ERROR_MESSAGES, type AjvErrorLocaleMessages } from "./ajv-error-messages";

type AjvI18nLocalizeFn = (errors?: null | ErrorObject[]) => void;

const AJV_I18N_LOCALIZERS: Record<AppLanguage, AjvI18nLocalizeFn> = {
  [AppLanguage.EN]: localizeEn,
  [AppLanguage.RU]: localizeRu,
};

const resolveLanguage = (language: RjsfLanguageSource): AppLanguage =>
  typeof language === "function" ? language() : language;

const capitalizeMessage = (message: string, language: AppLanguage): string => {
  if (!message) {
    return message;
  }
  return message.charAt(0).toLocaleUpperCase(language) + message.slice(1);
};

const formatTypeMessage = (messages: AjvErrorLocaleMessages, typeParam: unknown): string => {
  const typeNames = Array.isArray(typeParam) ? typeParam.map(String) : [String(typeParam)];
  const formatted = typeNames
    .map((typeName) => messages.typeLabels[typeName] ?? typeName)
    .join(", ");
  return messages.typeTemplate.replaceAll("{{type}}", formatted);
};

const applyCustomMessage = (error: ErrorObject, messages: AjvErrorLocaleMessages): boolean => {
  if (error.keyword === "required") {
    error.message = messages.required;
    return true;
  }

  if (error.keyword === "type") {
    error.message = formatTypeMessage(messages, error.params.type);
    return true;
  }

  return false;
};

export function createAjvErrorLocalizer(language: RjsfLanguageSource): Localizer {
  return (errors) => {
    if (!errors?.length) {
      return;
    }

    const currentLanguage = resolveLanguage(language);
    const messages = AJV_ERROR_MESSAGES[currentLanguage];
    const fallbackLocalizer = AJV_I18N_LOCALIZERS[currentLanguage];
    const fallbackErrors: ErrorObject[] = [];

    for (const error of errors) {
      if (!applyCustomMessage(error, messages)) {
        fallbackErrors.push(error);
      }
    }

    if (fallbackErrors.length > 0) {
      fallbackLocalizer(fallbackErrors);
    }

    for (const error of errors) {
      if (error.message) {
        error.message = capitalizeMessage(error.message, currentLanguage);
      }
    }
  };
}
