import type { AppError } from "./app-error";

/** Структурный контракт antd FormInstance — ровно то, что нужно для маппинга 422. */
export interface FormFieldsSetter {
  setFields(fields: Array<{ name: Array<string | number>; errors: string[] }>): void;
}

/** FastAPI кладёт первым элементом loc источник параметра — в имени поля формы его нет. */
const LOC_PREFIXES = new Set(["body", "query", "path", "header"]);

/**
 * Маппинг 422 (`detail[].loc` → `form.setFields`). Возвращает false, если ни один
 * элемент не удалось привязать к полю, — тогда ошибку показывают обычным путём.
 */
export function applyValidationErrors(form: FormFieldsSetter, error: AppError): boolean {
  const fields = (error.validationItems ?? [])
    .filter((item) => item.loc && item.loc.length > 0)
    .map((item) => {
      const loc = item.loc as Array<string | number>;
      const name = LOC_PREFIXES.has(String(loc[0])) ? loc.slice(1) : loc;
      return { name, errors: [item.msg] };
    })
    .filter((field) => field.name.length > 0);

  if (!fields.length) return false;
  form.setFields(fields);
  return true;
}
