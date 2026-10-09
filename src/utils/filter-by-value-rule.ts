import { normalizeDatetimeFilterValue } from "./datetime";
import type { FilterFieldOptions } from "./filter-schema-field";
import type { FilterRuleIdentity } from "./toggle-filter-rule";

function isFilterPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function toFilterByValueRuleValue(
  value: string | number | boolean,
  options: Pick<FilterFieldOptions, "isDatetime" | "isCheckbox" | "stringifyBoolean">
): FilterRuleIdentity["value"] {
  if (options.isDatetime) {
    return normalizeDatetimeFilterValue(value);
  }

  if (typeof value === "boolean") {
    if (options.stringifyBoolean && !options.isCheckbox) {
      return value ? "true" : "false";
    }
    return value;
  }

  if (typeof value === "number") {
    return value;
  }

  return value;
}

export function buildFilterByValueRule(
  field: string,
  value: unknown,
  options: FilterFieldOptions
): FilterRuleIdentity | null {
  if (value == null) {
    if (!options.supportsNull) {
      return null;
    }

    return { field, operator: "null", value: "" };
  }

  if (value === "") {
    return { field, operator: "=", value: "" };
  }

  if (Array.isArray(value)) {
    if (value.length === 0 || !value.every(isFilterPrimitive)) {
      return null;
    }

    return {
      field,
      operator: "in",
      value: value.map((item) => toFilterByValueRuleValue(item, options)).join(","),
    };
  }

  if (!isFilterPrimitive(value)) {
    return null;
  }

  return {
    field,
    operator: "=",
    value: toFilterByValueRuleValue(value, options),
  };
}
