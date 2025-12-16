import dayjs from "dayjs";
import {
  RuleGroupType,
  RuleType,
  ValueProcessorByRule,
  defaultRuleProcessorJsonLogic,
  defaultRuleProcessorMongoDB,
  generateID,
  isRuleGroupType,
} from "react-querybuilder";

import { DATETIME_TIMESTAMP, formatTimeByUserTZ } from "saltbox-common/utils/datetime";

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
