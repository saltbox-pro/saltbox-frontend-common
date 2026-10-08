import type { OptionList } from "react-querybuilder";

type FilterSchemaField = {
  name: string;
  inputType?: string | null;
  valueEditorType?: string | null;
  operators?: unknown;
};

function isOptionGroup(item: unknown): item is { options: OptionList } {
  return (
    typeof item === "object" &&
    item != null &&
    "options" in item &&
    Array.isArray(item.options) &&
    !("name" in item)
  );
}

function readOptionalStringOrNull(
  item: object,
  key: "inputType" | "valueEditorType"
): string | null | undefined {
  if (!(key in item)) {
    return undefined;
  }

  const value: unknown = item[key];
  if (typeof value === "string") {
    return value;
  }
  if (value === null) {
    return null;
  }

  return undefined;
}

function asFilterSchemaField(item: object): FilterSchemaField | undefined {
  if (!("name" in item) || typeof item.name !== "string") {
    return undefined;
  }

  return {
    name: item.name,
    inputType: readOptionalStringOrNull(item, "inputType"),
    valueEditorType: readOptionalStringOrNull(item, "valueEditorType"),
    operators: "operators" in item ? item.operators : undefined,
  };
}

function findFilterField(schema: OptionList, fieldName: string): FilterSchemaField | undefined {
  for (const item of schema) {
    if (isOptionGroup(item)) {
      const nested = findFilterField(item.options, fieldName);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (typeof item !== "object" || item == null) {
      continue;
    }

    const field = asFilterSchemaField(item);
    if (field?.name === fieldName) {
      return field;
    }
  }

  return undefined;
}

export type FilterFieldOptions = {
  supportsNull: boolean;
  isDatetime: boolean;
  isCheckbox: boolean;
};

function readOperatorName(operator: unknown): string | null {
  if (typeof operator === "string") {
    return operator;
  }

  if (typeof operator === "object" && operator != null && "name" in operator) {
    const name = (operator as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }

  return null;
}

function fieldHasNullOperator(field: FilterSchemaField | undefined): boolean {
  const operators = field?.operators;
  if (!Array.isArray(operators)) {
    return false;
  }

  return operators.some((operator) => readOperatorName(operator) === "null");
}

export function getFilterFieldOptions(schema: OptionList, fieldName: string): FilterFieldOptions {
  const field = findFilterField(schema, fieldName);
  return {
    supportsNull: fieldHasNullOperator(field),
    isDatetime: field?.inputType === "datetime-local",
    isCheckbox: field?.valueEditorType === "checkbox",
  };
}
