import type { OptionList } from "react-querybuilder";

import { MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING } from "./filter-field-constants";

export type FilterSchemaField = {
  name: string;
  inputType?: string | null;
  valueEditorType?: string | null;
  mongoValueCoercion?: string | null;
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
  key: "inputType" | "valueEditorType" | "mongoValueCoercion"
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
    mongoValueCoercion: readOptionalStringOrNull(item, "mongoValueCoercion"),
    operators: "operators" in item ? item.operators : undefined,
  };
}

export function flattenFilterSchemaFields(schema: OptionList): FilterSchemaField[] {
  const result: FilterSchemaField[] = [];

  for (const item of schema) {
    if (isOptionGroup(item)) {
      result.push(...flattenFilterSchemaFields(item.options));
      continue;
    }

    if (typeof item !== "object" || item == null) {
      continue;
    }

    const field = asFilterSchemaField(item);
    if (field) {
      result.push(field);
    }
  }

  return result;
}

export function findFilterSchemaField(
  schema: OptionList,
  fieldName: string
): FilterSchemaField | undefined {
  for (const item of schema) {
    if (isOptionGroup(item)) {
      const nested = findFilterSchemaField(item.options, fieldName);
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
  stringifyBoolean: boolean;
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
  const field = findFilterSchemaField(schema, fieldName);
  return {
    supportsNull: fieldHasNullOperator(field),
    isDatetime: field?.inputType === "datetime-local",
    isCheckbox: field?.valueEditorType === "checkbox",
    stringifyBoolean:
      field?.mongoValueCoercion === MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING ||
      field?.valueEditorType === "select",
  };
}
