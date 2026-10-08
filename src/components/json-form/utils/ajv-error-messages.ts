import { AppLanguage } from "../../../interfaces/locales";

export type AjvErrorLocaleMessages = {
  required: string;
  typeTemplate: string;
  typeLabels: Record<string, string>;
};

export const AJV_ERROR_MESSAGES: Record<AppLanguage, AjvErrorLocaleMessages> = {
  [AppLanguage.EN]: {
    required: "Required field",
    typeTemplate: "Must be {{type}}",
    typeLabels: {
      string: "a string",
      number: "a number",
      integer: "an integer",
      boolean: "a boolean",
      array: "an array",
      object: "an object",
      null: "null",
    },
  },
  [AppLanguage.RU]: {
    required: "Обязательное поле",
    typeTemplate: "Должно быть {{type}}",
    typeLabels: {
      string: "строкой",
      number: "числом",
      integer: "целым числом",
      boolean: "логическим значением",
      array: "массивом",
      object: "объектом",
      null: "null",
    },
  },
};
