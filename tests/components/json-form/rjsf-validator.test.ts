import { describe, expect, it } from "vitest";

import { createRjsfValidator } from "../../../src/components/json-form/utils/rjsf-validator";
import { AJV_ERROR_MESSAGES } from "../../../src/components/json-form/utils/ajv-error-messages";
import { APP_LANGUAGES, AppLanguage } from "../../../src/interfaces/locales";

const typeSchema = {
  type: "object",
  properties: {
    path: { type: "string" },
  },
} as const;

const requiredSchema = {
  type: "object",
  required: ["module"],
  properties: {
    module: { type: "string", title: "Module" },
  },
} as const;

const patternSchema = {
  type: "object",
  properties: {
    code: { type: "string", pattern: "^\\d+$" },
  },
} as const;

describe("createRjsfValidator", () => {
  it("локализует ошибку type на русском цельной фразой", () => {
    const validator = createRjsfValidator(AppLanguage.RU);
    const { errors } = validator.validateFormData({ path: 1 }, typeSchema);

    expect(errors[0]?.message).toBe("Должно быть строкой");
  });

  it("локализует ошибку type на английском цельной фразой", () => {
    const validator = createRjsfValidator(AppLanguage.EN);
    const { errors } = validator.validateFormData({ path: 1 }, typeSchema);

    expect(errors[0]?.message).toBe("Must be a string");
  });

  it("локализует ошибку required на русском без имени поля", () => {
    const validator = createRjsfValidator(AppLanguage.RU);
    const { errors } = validator.validateFormData({}, requiredSchema);

    expect(errors[0]?.message).toBe("Обязательное поле");
  });

  it("локализует ошибку required на английском без имени поля", () => {
    const validator = createRjsfValidator(AppLanguage.EN);
    const { errors } = validator.validateFormData({}, requiredSchema);

    expect(errors[0]?.message).toBe("Required field");
  });

  it("капитализирует fallback-сообщения ajv-i18n", () => {
    const validator = createRjsfValidator(AppLanguage.RU);
    const { errors } = validator.validateFormData({ code: "abc" }, patternSchema);

    expect(errors[0]?.message).toBe('Должно соответствовать образцу "^\\d+$"');
  });

  it("подхватывает смену языка без пересоздания валидатора", () => {
    let language = AppLanguage.EN;
    const validator = createRjsfValidator(() => language);

    expect(validator.validateFormData({ path: 1 }, typeSchema).errors[0]?.message).toBe(
      "Must be a string"
    );

    language = AppLanguage.RU;

    expect(validator.validateFormData({ path: 1 }, typeSchema).errors[0]?.message).toBe(
      "Должно быть строкой"
    );
  });
});

describe("AJV_ERROR_MESSAGES catalog", () => {
  it("contains messages for every AppLanguage", () => {
    for (const language of APP_LANGUAGES) {
      expect(AJV_ERROR_MESSAGES[language]?.required).toBeTruthy();
      expect(AJV_ERROR_MESSAGES[language]?.typeTemplate).toContain("{{type}}");
      expect(AJV_ERROR_MESSAGES[language]?.typeLabels.string).toBeTruthy();
    }
  });
});
