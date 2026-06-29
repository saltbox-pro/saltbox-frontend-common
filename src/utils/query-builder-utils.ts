import dayjs from "dayjs";
import {
  formatQuery,
  type OptionList,
  RuleGroupType,
  RuleType,
  ValueProcessorByRule,
  defaultRuleProcessorJsonLogic,
  defaultRuleProcessorMongoDB,
  generateID,
  isRuleGroupType,
} from "react-querybuilder";

import { DATETIME_TIMESTAMP, formatTimeByUserTZ } from "saltbox-common/utils/datetime";
import { normalizeListInputValue } from "saltbox-common/utils/normalize-list-input-value";

export const MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING = "booleanFromString" as const;

const NUMERIC_ARRAY_FIELDS = ["osrelease_info", "grains.osrelease_info"];

function isNumericArrayField(field: string): boolean {
  return NUMERIC_ARRAY_FIELDS.some((f) => field === f || field.endsWith(`.${f}`));
}

function coerceToNumberArray(parts: string[]): number[] | null {
  if (!parts.length) {
    return null;
  }

  const nums = parts.map((part) => parseInt(part, 10)).filter((num) => !Number.isNaN(num));

  return nums.length > 0 ? nums : null;
}

export const customRuleProcessorMongoDB: ValueProcessorByRule = (rule, options) => {
  if (
    rule.valueSource !== "field" &&
    [
      "contains",
      "beginswith",
      "endswith",
      "doesnotcontain",
      "doesnotbeginwith",
      "doesnotendwith",
    ].includes(rule.operator)
  ) {
    return defaultRuleProcessorMongoDB(
      { ...rule, value: rule.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") },
      options
    );
  }

  if (
    (rule.operator === "in" || rule.operator === "notIn") &&
    rule.valueSource !== "field" &&
    (typeof rule.value === "string" || Array.isArray(rule.value))
  ) {
    const normalizedValues = normalizeListInputValue(rule.value);
    if (normalizedValues.length > 0) {
      if (isNumericArrayField(rule.field)) {
        const numArr = coerceToNumberArray(normalizedValues);
        if (numArr !== null) {
          return defaultRuleProcessorMongoDB({ ...rule, value: numArr }, options);
        }

        return defaultRuleProcessorMongoDB(rule, options);
      }

      return defaultRuleProcessorMongoDB({ ...rule, value: normalizedValues }, options);
    }
  }

  const mongoCoercion = (options?.fieldData as { mongoValueCoercion?: string } | undefined)
    ?.mongoValueCoercion;
  if (
    mongoCoercion === MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING &&
    typeof rule.value === "string" &&
    (rule.value === "true" || rule.value === "false")
  ) {
    return defaultRuleProcessorMongoDB({ ...rule, value: rule.value === "true" }, options);
  }

  return defaultRuleProcessorMongoDB(rule, options);
};

export const customRuleProcessorJsonLogic: ValueProcessorByRule = (rule, options) => {
  if (dayjs.isDayjs(rule.value)) {
    return defaultRuleProcessorJsonLogic(
      { ...rule, value: formatTimeByUserTZ(rule.value, DATETIME_TIMESTAMP) },
      options
    );
  }

  return defaultRuleProcessorJsonLogic(rule, options);
};

export function generateIdsForQuery<T extends RuleGroupType | RuleType>(query: T): T {
  const newQuery = { ...query };
  newQuery.id = generateID();
  if (isRuleGroupType(newQuery)) {
    newQuery.rules = newQuery.rules.map((rule) => generateIdsForQuery(rule));
  }
  return newQuery;
}

export function isMongoQueryEmpty(query?: unknown): boolean {
  if (!query || typeof query !== "object") return true;

  if (Array.isArray(query)) {
    return query.length === 0 || query.every((item) => isMongoQueryEmpty(item));
  }

  const entries = Object.entries(query as Record<string, unknown>);
  if (entries.length === 0) return true;

  if (entries.length === 1) {
    const [key, value] = entries[0];
    if (key === "$expr" && value === true) {
      return true;
    }
    if (["$and", "$or", "$nor"].includes(key)) {
      return isMongoQueryEmpty(value);
    }
  }

  return false;
}

export const emptyRuleGroup: RuleGroupType = {
  rules: [],
  combinator: "and",
  not: false,
} as const;

export function createRuleGroup(
  combinator: "and" | "or",
  rules: RuleGroupType["rules"]
): RuleGroupType {
  return {
    combinator,
    rules,
    not: false,
  };
}

export function formatToMongoDB(filters: RuleGroupType, fields?: OptionList): object {
  const queryString = formatQuery(filters, {
    format: "mongodb",
    valueProcessor: customRuleProcessorMongoDB,
    ...(fields && fields.length > 0 ? { fields } : {}),
  });

  try {
    return JSON.parse(queryString);
  } catch (error) {
    console.error("Failed to parse MongoDB query:", error);
    return {};
  }
}
