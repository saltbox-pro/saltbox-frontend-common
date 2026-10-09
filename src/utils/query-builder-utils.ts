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
import { parseMongoDB } from "react-querybuilder/parseMongoDB";

import {
  DATETIME_TIMESTAMP,
  formatTimeByUserTZ,
  normalizeDatetimeFilterValue,
  toApiDatetime,
} from "saltbox-common/utils/datetime";
import { normalizeListInputValue } from "saltbox-common/utils/normalize-list-input-value";

import { MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING } from "./filter-field-constants";
import { flattenFilterSchemaFields, type FilterSchemaField } from "./filter-schema-field";

export const CASE_INSENSITIVE_PREFIX = "(?i)";

const REGEXP_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;
const ESCAPED_REGEXP_METACHARACTER = /\\([.*+?^${}()|[\]\\])/g;
const ESCAPED_LITERAL_PATTERN = /^(?:\\[.*+?^${}()|[\]\\]|[^.*+?^${}()|[\]\\])*$/;

const NUMERIC_ARRAY_FIELDS = ["osrelease_info", "grains.osrelease_info"];

const TEXT_REGEXP_OPERATORS = new Set([
  "contains",
  "beginswith",
  "endswith",
  "doesnotcontain",
  "doesnotbeginwith",
  "doesnotendwith",
]);

const CASE_SENSITIVE_INPUT_TYPES = new Set(["number", "date", "datetime-local"]);
const CASE_SENSITIVE_EDITOR_TYPES = new Set(["checkbox", "select", "multiselect", "radio"]);

type FilterFieldData = {
  mongoValueCoercion?: string;
  inputType?: string | null;
  valueEditorType?: string | null;
  type?: string | null;
  caseSensitive?: boolean;
};

export function escapeRegExp(value: string): string {
  return value.replace(REGEXP_METACHARACTERS, "\\$&");
}

function unescapeRegExp(value: string): string {
  return value.replace(ESCAPED_REGEXP_METACHARACTER, "$1");
}

function isNumericArrayField(field: string): boolean {
  return NUMERIC_ARRAY_FIELDS.some((f) => field === f || field.endsWith(`.${f}`));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCaseInsensitiveField(fieldData: FilterFieldData | undefined, field: string): boolean {
  if (!fieldData || fieldData.caseSensitive) {
    return false;
  }
  if (fieldData.mongoValueCoercion === MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING) {
    return false;
  }
  if (fieldData.inputType && CASE_SENSITIVE_INPUT_TYPES.has(fieldData.inputType)) {
    return false;
  }
  if (fieldData.valueEditorType && CASE_SENSITIVE_EDITOR_TYPES.has(fieldData.valueEditorType)) {
    return false;
  }
  if (fieldData.type && CASE_SENSITIVE_EDITOR_TYPES.has(fieldData.type)) {
    return false;
  }

  return !isNumericArrayField(field);
}

function exactMatchPattern(value: string): string {
  return `${CASE_INSENSITIVE_PREFIX}^${escapeRegExp(value)}$`;
}

function buildEqualityFragment(field: string, value: string, negated: boolean): string {
  const condition = { $regex: exactMatchPattern(value) };

  return JSON.stringify({ [field]: negated ? { $not: condition } : condition });
}

function buildListFragment(field: string, values: string[], negated: boolean): string {
  const conditions = values.map((value) => ({ [field]: { $regex: exactMatchPattern(value) } }));

  return JSON.stringify(negated ? { $nor: conditions } : { $or: conditions });
}

function addCaseInsensitiveFlagToNode(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(addCaseInsensitiveFlagToNode);
  }
  if (!isPlainObject(node)) {
    return node;
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => {
      if (key === "$regex" && typeof value === "string") {
        return [
          key,
          value.startsWith(CASE_INSENSITIVE_PREFIX) ? value : `${CASE_INSENSITIVE_PREFIX}${value}`,
        ];
      }

      return [key, addCaseInsensitiveFlagToNode(value)];
    })
  );
}

function addCaseInsensitiveFlag(fragment: string): string {
  if (!fragment) {
    return fragment;
  }

  try {
    return JSON.stringify(addCaseInsensitiveFlagToNode(JSON.parse(fragment)));
  } catch {
    return fragment;
  }
}

function coerceToNumberArray(parts: string[]): number[] | null {
  if (!parts.length) {
    return null;
  }

  const nums = parts.map((part) => parseInt(part, 10)).filter((num) => !Number.isNaN(num));

  return nums.length > 0 ? nums : null;
}

export function createRuleProcessorMongoDB(
  processorOptions: { caseInsensitive?: boolean } = {}
): ValueProcessorByRule {
  const caseInsensitiveEnabled = processorOptions.caseInsensitive ?? true;

  return (rule, options) => {
    const operator = rule.operator.toLowerCase();
    const fieldData = options?.fieldData as FilterFieldData | undefined;
    const isNumberField = fieldData?.inputType === "number";
    const isCaseInsensitive =
      caseInsensitiveEnabled && isCaseInsensitiveField(fieldData, rule.field);

    if (
      rule.valueSource !== "field" &&
      TEXT_REGEXP_OPERATORS.has(operator) &&
      typeof rule.value === "string"
    ) {
      const fragment = defaultRuleProcessorMongoDB(
        { ...rule, value: escapeRegExp(rule.value) },
        options
      );

      return isCaseInsensitive ? addCaseInsensitiveFlag(fragment) : fragment;
    }

    if (
      (operator === "in" || operator === "notin") &&
      rule.valueSource !== "field" &&
      (typeof rule.value === "string" || Array.isArray(rule.value))
    ) {
      const normalizedValues = normalizeListInputValue(rule.value);
      if (normalizedValues.length > 0) {
        if (isNumericArrayField(rule.field) || isNumberField) {
          const numArr = coerceToNumberArray(normalizedValues);
          if (numArr !== null) {
            return defaultRuleProcessorMongoDB({ ...rule, value: numArr }, options);
          }

          return defaultRuleProcessorMongoDB(rule, options);
        }

        if (isCaseInsensitive) {
          return buildListFragment(rule.field, normalizedValues, operator === "notin");
        }

        return defaultRuleProcessorMongoDB({ ...rule, value: normalizedValues }, options);
      }
    }

    if (isNumberField && typeof rule.value === "string" && rule.value.trim() !== "") {
      const numValue = Number(rule.value);
      if (Number.isFinite(numValue)) {
        return defaultRuleProcessorMongoDB({ ...rule, value: numValue }, options);
      }
    }

    const isBooleanField =
      fieldData?.mongoValueCoercion === MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING ||
      fieldData?.valueEditorType === "checkbox";
    if (
      isBooleanField &&
      typeof rule.value === "string" &&
      (rule.value === "true" || rule.value === "false")
    ) {
      return defaultRuleProcessorMongoDB({ ...rule, value: rule.value === "true" }, options);
    }

    if (
      (operator === "=" || operator === "!=") &&
      rule.valueSource !== "field" &&
      isCaseInsensitive &&
      typeof rule.value === "string" &&
      rule.value !== ""
    ) {
      return buildEqualityFragment(rule.field, rule.value, operator === "!=");
    }

    if (dayjs.isDayjs(rule.value)) {
      return defaultRuleProcessorMongoDB({ ...rule, value: toApiDatetime(rule.value) }, options);
    }

    const isDatetimeField =
      fieldData?.inputType === "datetime-local" || fieldData?.valueEditorType === "datetime-local";
    if (isDatetimeField && typeof rule.value === "string" && rule.value !== "") {
      const normalized = normalizeDatetimeFilterValue(rule.value);
      if (normalized !== rule.value) {
        return defaultRuleProcessorMongoDB({ ...rule, value: normalized }, options);
      }
    }

    return defaultRuleProcessorMongoDB(rule, options);
  };
}

export const customRuleProcessorMongoDB: ValueProcessorByRule = createRuleProcessorMongoDB();

const caseSensitiveRuleProcessorMongoDB: ValueProcessorByRule = createRuleProcessorMongoDB({
  caseInsensitive: false,
});

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

function getMarkedPattern(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith(CASE_INSENSITIVE_PREFIX)
    ? value.slice(CASE_INSENSITIVE_PREFIX.length)
    : undefined;
}

function getAnchoredLiteral(pattern: string): string | undefined {
  if (!pattern.startsWith("^") || !pattern.endsWith("$") || pattern.endsWith("\\$")) {
    return undefined;
  }

  const body = pattern.slice(1, -1);

  return ESCAPED_LITERAL_PATTERN.test(body) ? unescapeRegExp(body) : undefined;
}

function unescapeLiteralPattern(pattern: string): string {
  const prefix = pattern.startsWith("^") ? "^" : "";
  const suffix = pattern.endsWith("$") && !pattern.endsWith("\\$") ? "$" : "";
  const body = pattern.slice(prefix.length, pattern.length - suffix.length);

  return ESCAPED_LITERAL_PATTERN.test(body) ? `${prefix}${unescapeRegExp(body)}${suffix}` : pattern;
}

function restoreFieldCondition(value: unknown): unknown | undefined {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const keys = Object.keys(value);
  if (keys.length !== 1) {
    return undefined;
  }

  if (keys[0] === "$regex") {
    const pattern = getMarkedPattern(value.$regex);
    if (pattern === undefined) {
      return undefined;
    }

    const literal = getAnchoredLiteral(pattern);

    return literal === undefined ? { $regex: unescapeLiteralPattern(pattern) } : literal;
  }

  if (keys[0] === "$not") {
    const inner = value.$not;
    if (!isPlainObject(inner) || Object.keys(inner).length !== 1) {
      return undefined;
    }

    const pattern = getMarkedPattern(inner.$regex);
    if (pattern === undefined) {
      return undefined;
    }

    const literal = getAnchoredLiteral(pattern);

    return literal === undefined
      ? { $not: { $regex: unescapeLiteralPattern(pattern) } }
      : { $ne: literal };
  }

  return undefined;
}

function restoreListCondition(node: Record<string, unknown>): unknown | undefined {
  const keys = Object.keys(node);
  if (keys.length !== 1 || (keys[0] !== "$or" && keys[0] !== "$nor")) {
    return undefined;
  }

  const conditions = node[keys[0]];
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return undefined;
  }

  let field: string | undefined;
  const values: string[] = [];

  for (const condition of conditions) {
    if (!isPlainObject(condition)) {
      return undefined;
    }

    const conditionKeys = Object.keys(condition);
    if (conditionKeys.length !== 1) {
      return undefined;
    }

    if (field === undefined) {
      field = conditionKeys[0];
    } else if (field !== conditionKeys[0]) {
      return undefined;
    }

    const regexNode = condition[conditionKeys[0]];
    if (!isPlainObject(regexNode) || Object.keys(regexNode).length !== 1) {
      return undefined;
    }

    const pattern = getMarkedPattern(regexNode.$regex);
    if (pattern === undefined) {
      return undefined;
    }

    const literal = getAnchoredLiteral(pattern);
    if (literal === undefined) {
      return undefined;
    }

    values.push(literal);
  }

  return { [field as string]: { [keys[0] === "$or" ? "$in" : "$nin"]: values } };
}

function restoreCaseInsensitiveNode(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(restoreCaseInsensitiveNode);
  }
  if (!isPlainObject(node)) {
    return node;
  }

  const restoredList = restoreListCondition(node);
  if (restoredList !== undefined) {
    return restoredList;
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => {
      const restoredCondition = restoreFieldCondition(value);

      return [
        key,
        restoredCondition === undefined ? restoreCaseInsensitiveNode(value) : restoredCondition,
      ];
    })
  );
}

export function parseCaseInsensitiveQuery<T>(query: T): T {
  if (!query || typeof query !== "object") {
    return query;
  }

  return restoreCaseInsensitiveNode(query) as T;
}

export type FormatToMongoDBOptions = {
  caseInsensitive?: boolean;
};

export function formatToMongoDB(
  filters: RuleGroupType,
  fields?: OptionList,
  options?: FormatToMongoDBOptions
): object {
  const queryString = formatQuery(filters, {
    format: "mongodb",
    valueProcessor:
      options?.caseInsensitive === false
        ? caseSensitiveRuleProcessorMongoDB
        : customRuleProcessorMongoDB,
    ...(fields && fields.length > 0 ? { fields } : {}),
  });

  try {
    return JSON.parse(queryString);
  } catch (error) {
    console.error("Failed to parse MongoDB query:", error);
    return {};
  }
}

type FilterJsonSchemaType = "number" | "boolean" | "string";

const MONGO_COMPARISON_OPS = new Set(["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"]);
const MONGO_LIST_OPS = new Set(["$in", "$nin"]);

function getFilterFieldJsonSchemaType(fieldData: FilterSchemaField): FilterJsonSchemaType {
  if (fieldData.inputType === "number" || isNumericArrayField(fieldData.name)) {
    return "number";
  }
  if (
    fieldData.mongoValueCoercion === MONGO_VALUE_COERCION_BOOLEAN_FROM_STRING ||
    fieldData.valueEditorType === "checkbox"
  ) {
    return "boolean";
  }
  return "string";
}

function buildFilterFieldOperatorSchema(jsonType: FilterJsonSchemaType): Record<string, unknown> {
  const scalar = { type: jsonType };
  const properties: Record<string, unknown> = {
    $eq: scalar,
    $ne: scalar,
    $gt: scalar,
    $gte: scalar,
    $lt: scalar,
    $lte: scalar,
    $in: { type: "array", items: scalar, minItems: 1 },
    $nin: { type: "array", items: scalar, minItems: 1 },
    $not: { type: "object", minProperties: 1 },
  };

  if (jsonType === "string") {
    properties.$regex = { type: "string" };
  }

  return {
    type: "object",
    minProperties: 1,
    additionalProperties: false,
    properties,
  };
}

function buildFilterFieldValueSchema(jsonType: FilterJsonSchemaType): Record<string, unknown> {
  return {
    anyOf: [{ type: jsonType }, { type: "null" }, buildFilterFieldOperatorSchema(jsonType)],
  };
}

export function filtersFromMongoQuery(parsed: object): RuleGroupType | null {
  try {
    if (isMongoQueryEmpty(parsed)) {
      return emptyRuleGroup;
    }

    const filters = generateIdsForQuery(parseMongoDB(parseCaseInsensitiveQuery(parsed)));
    if (!filters.rules.length) {
      return null;
    }

    return filters;
  } catch {
    return null;
  }
}

export function buildFreeTextFilterJsonSchema(fields: OptionList): Record<string, unknown> {
  const properties: Record<string, Record<string, unknown>> = {};

  for (const field of flattenFilterSchemaFields(fields)) {
    properties[field.name] = buildFilterFieldValueSchema(getFilterFieldJsonSchemaType(field));
  }

  const filterClause = {
    type: "object",
    properties: {
      ...properties,
      $and: { type: "array", items: { $ref: "#/definitions/filterClause" }, minItems: 1 },
      $or: { type: "array", items: { $ref: "#/definitions/filterClause" }, minItems: 1 },
      $nor: false,
    },
    additionalProperties: true,
  };

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
      filterClause,
    },
    $ref: "#/definitions/filterClause",
  };
}

function isValidOperatorObject(
  value: Record<string, unknown>,
  jsonType: FilterJsonSchemaType
): boolean {
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }

  for (const [op, operand] of Object.entries(value)) {
    if (MONGO_COMPARISON_OPS.has(op)) {
      if (typeof operand !== jsonType) {
        return false;
      }
      continue;
    }

    if (MONGO_LIST_OPS.has(op)) {
      if (!Array.isArray(operand) || operand.length === 0) {
        return false;
      }
      if (!operand.every((item) => typeof item === jsonType)) {
        return false;
      }
      continue;
    }

    if (op === "$regex") {
      if (jsonType !== "string" || typeof operand !== "string") {
        return false;
      }
      continue;
    }

    if (op === "$not") {
      if (!isPlainObject(operand) || !isValidOperatorObject(operand, jsonType)) {
        return false;
      }
      continue;
    }

    return false;
  }

  return true;
}

function isValidFreeTextFieldValue(value: unknown, expectedType: FilterJsonSchemaType): boolean {
  if (value === null) {
    return true;
  }
  if (isPlainObject(value)) {
    return isValidOperatorObject(value, expectedType);
  }
  return typeof value === expectedType;
}

function isParseableMongoFieldPredicate(field: string, value: unknown): boolean {
  try {
    const parsed = parseMongoDB({ [field]: value });
    return Array.isArray(parsed.rules) && parsed.rules.length > 0;
  } catch {
    return false;
  }
}

function freeTextFilterClauseHasTypeErrors(
  node: unknown,
  typeByField: Map<string, FilterJsonSchemaType>
): boolean {
  if (!isPlainObject(node)) {
    return true;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "$and" || key === "$or") {
      if (!Array.isArray(value) || value.length === 0) {
        return true;
      }
      if (value.some((item) => freeTextFilterClauseHasTypeErrors(item, typeByField))) {
        return true;
      }
      continue;
    }

    if (key === "$nor") {
      return true;
    }

    const expectedType = typeByField.get(key);
    if (expectedType) {
      if (!isValidFreeTextFieldValue(value, expectedType)) {
        return true;
      }
    } else if (Array.isArray(value)) {
      return true;
    } else if (isPlainObject(value) && Object.keys(value).length === 0) {
      return true;
    }

    if (!isParseableMongoFieldPredicate(key, value)) {
      return true;
    }
  }

  return false;
}

export function freeTextFilterQueryHasTypeErrors(parsed: object, fields: OptionList): boolean {
  if (isMongoQueryEmpty(parsed)) {
    return false;
  }

  const typeByField = new Map(
    flattenFilterSchemaFields(fields).map((field) => [
      field.name,
      getFilterFieldJsonSchemaType(field),
    ])
  );

  return freeTextFilterClauseHasTypeErrors(parsed, typeByField);
}
