import dayjs from "dayjs";
import {
  formatQuery,
  RuleGroupType,
  RuleType,
  ValueProcessorByRule,
  defaultRuleProcessorJsonLogic,
  defaultRuleProcessorMongoDB,
  generateID,
  isRuleGroupType,
} from "react-querybuilder";

import { DATETIME_TIMESTAMP, formatTimeByUserTZ } from "saltbox-common/utils/datetime";

const NUMERIC_ARRAY_FIELDS = ["osrelease_info", "grains.osrelease_info"];

function isNumericArrayField(field: string): boolean {
  return NUMERIC_ARRAY_FIELDS.some((f) => field === f || field.endsWith(`.${f}`));
}

function coerceToNumberArray(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    const nums = value.map((v) => (typeof v === "number" ? v : parseInt(String(v), 10)));
    if (nums.every((n) => !Number.isNaN(n))) return nums;
    return null;
  }
  if (typeof value === "string") {
    const nums = value
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    return nums.length ? nums : null;
  }
  return null;
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

  if ((rule.operator === "in" || rule.operator === "notIn") && isNumericArrayField(rule.field)) {
    const numArr = coerceToNumberArray(rule.value);
    if (numArr !== null) {
      return defaultRuleProcessorMongoDB({ ...rule, value: numArr }, options);
    }
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

export function formatToMongoDB(filters: RuleGroupType): object {
  const queryString = formatQuery(filters, {
    format: "mongodb",
    valueProcessor: customRuleProcessorMongoDB,
  });

  try {
    return JSON.parse(queryString);
  } catch (error) {
    console.error("Failed to parse MongoDB query:", error);
    return {};
  }
}
