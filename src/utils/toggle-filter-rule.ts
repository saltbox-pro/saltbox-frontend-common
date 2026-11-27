import { generateID, type RuleGroupType, type RuleType } from "react-querybuilder";

import { getExtraCategoryPrefix } from "./extra-category-prefix";
import { createRuleGroup, ITEM_COMBINATOR_AND, isItemCombinator } from "./query-builder-utils";
import { withValueRule } from "./with-value-rule";

export type FilterRuleIdentity = {
  field: string;
  operator: string;
  value: string | number | boolean;
};

export type ToggleFilterRuleMode = "append" | "replace-field" | "flatten-field";

type ToggleFilterRuleResult = {
  group: RuleGroupType;
  result: "added" | "removed";
};

function isRuleGroup(rule: RuleGroupType["rules"][number]): rule is RuleGroupType {
  return typeof rule === "object" && rule != null && "rules" in rule;
}

function everyRuleMatches(group: RuleGroupType, matches: (rule: RuleType) => boolean): boolean {
  return group.rules.every((rule) =>
    isRuleGroup(rule) ? everyRuleMatches(rule, matches) : matches(rule)
  );
}

function withFlattenedFieldRule(group: RuleGroupType, rule: RuleType): RuleGroupType {
  return {
    combinator: "and",
    rules: [...group.rules.filter((item) => "field" in item && item.field !== rule.field), rule],
  };
}

function valuesMatch(left: unknown, right: FilterRuleIdentity["value"]): boolean {
  if (left === right) {
    return true;
  }
  return String(left ?? "") === String(right);
}

function matchesRule(rule: RuleType, identity: FilterRuleIdentity): boolean {
  return (
    rule.field === identity.field &&
    rule.operator === identity.operator &&
    valuesMatch(rule.value, identity.value)
  );
}

export function hasFilterRule(group: RuleGroupType, identity: FilterRuleIdentity): boolean {
  if (group.not) return false;
  return group.rules.some((rule) => {
    if (isRuleGroup(rule)) {
      return hasFilterRule(rule, identity);
    }

    return matchesRule(rule, identity);
  });
}

function removeFirstMatch(
  group: RuleGroupType,
  identity: FilterRuleIdentity
): { group: RuleGroupType; removed: boolean } {
  if (group.not) return { group, removed: false };
  let removed = false;
  const rules: RuleGroupType["rules"] = [];

  for (const rule of group.rules) {
    if (removed) {
      rules.push(rule);
      continue;
    }

    if (isRuleGroup(rule)) {
      const nested = removeFirstMatch(rule, identity);
      removed = nested.removed;
      if (nested.group.rules.length > 0) {
        rules.push(nested.group);
      }
      continue;
    }

    if (matchesRule(rule, identity)) {
      removed = true;
      continue;
    }

    rules.push(rule);
  }

  return {
    group: { ...group, rules },
    removed,
  };
}

function toFilterRule(identity: FilterRuleIdentity): RuleType {
  return {
    id: generateID(),
    field: identity.field,
    operator: identity.operator,
    valueSource: "value",
    value: identity.value,
  };
}

function isCategoryField(field: string, categoryPrefix: string): boolean {
  return field.startsWith(categoryPrefix);
}

function isCategoryOnlyItemGroup(group: RuleGroupType, categoryPrefix: string): boolean {
  return (
    group.combinator === ITEM_COMBINATOR_AND &&
    !group.not &&
    group.rules.length > 0 &&
    everyRuleMatches(group, (rule) => isCategoryField(rule.field, categoryPrefix))
  );
}

function appendRuleToItemGroup(
  group: RuleGroupType,
  rule: RuleType,
  mode: ToggleFilterRuleMode
): RuleGroupType {
  const rules =
    mode === "replace-field"
      ? group.rules.filter((existing) => isRuleGroup(existing) || existing.field !== rule.field)
      : group.rules;
  return { ...group, rules: [...rules, rule] };
}

function appendFlatRule(
  group: RuleGroupType,
  rule: RuleType,
  mode: ToggleFilterRuleMode
): RuleGroupType {
  if (mode === "replace-field") {
    return withValueRule(group, rule);
  }

  return {
    ...group,
    rules: [...group.rules, rule],
  };
}

function promoteCategoryRulesIntoItemGroup(
  group: RuleGroupType,
  rule: RuleType,
  categoryPrefix: string,
  mode: ToggleFilterRuleMode
): RuleGroupType {
  const categoryRules: RuleType[] = [];
  const otherRules: RuleGroupType["rules"] = [];
  let existingItemGroup: RuleGroupType | null = null;

  for (const existing of group.rules) {
    if (isRuleGroup(existing)) {
      if (isCategoryOnlyItemGroup(existing, categoryPrefix) && existingItemGroup == null) {
        existingItemGroup = existing;
        continue;
      }
      otherRules.push(existing);
      continue;
    }

    if (isCategoryField(existing.field, categoryPrefix)) {
      if (mode === "replace-field" && existing.field === rule.field) {
        continue;
      }
      categoryRules.push(existing);
      continue;
    }

    otherRules.push(existing);
  }

  if (existingItemGroup == null && categoryRules.length === 0) {
    return appendFlatRule(group, rule, mode);
  }

  const itemGroupRules =
    existingItemGroup == null
      ? categoryRules
      : [
          ...(mode === "replace-field"
            ? existingItemGroup.rules.filter(
                (item) => isRuleGroup(item) || item.field !== rule.field
              )
            : existingItemGroup.rules),
          ...categoryRules,
        ];

  const itemGroup = appendRuleToItemGroup(
    existingItemGroup
      ? { ...existingItemGroup, rules: itemGroupRules }
      : createRuleGroup(ITEM_COMBINATOR_AND, itemGroupRules),
    rule,
    "append"
  );

  return {
    ...group,
    combinator: "and",
    not: false,
    rules: [...otherRules, itemGroup],
  };
}

function addExtraCategoryRule(
  group: RuleGroupType,
  rule: RuleType,
  categoryPrefix: string,
  mode: ToggleFilterRuleMode
): RuleGroupType {
  if (isItemCombinator(group.combinator)) {
    if (
      !group.not &&
      everyRuleMatches(group, (existing) => isCategoryField(existing.field, categoryPrefix))
    ) {
      return appendRuleToItemGroup(group, rule, mode);
    }

    return {
      combinator: "and",
      not: false,
      rules: [group, rule],
    };
  }

  if (group.rules.length === 0) {
    return appendFlatRule({ ...group, combinator: "and", not: false }, rule, mode);
  }

  if (group.combinator === "and" && !group.not) {
    return promoteCategoryRulesIntoItemGroup(group, rule, categoryPrefix, mode);
  }

  return {
    combinator: "and",
    not: false,
    rules: [group, rule],
  };
}

export function toggleFilterRule(
  group: RuleGroupType,
  identity: FilterRuleIdentity,
  mode: ToggleFilterRuleMode = "append"
): ToggleFilterRuleResult {
  const removed = removeFirstMatch(group, identity);
  if (removed.removed) {
    return {
      group: removed.group,
      result: "removed",
    };
  }

  const rule = toFilterRule(identity);
  const categoryPrefix = getExtraCategoryPrefix(rule.field);

  if (mode !== "flatten-field" && categoryPrefix) {
    return {
      group: addExtraCategoryRule(group, rule, categoryPrefix, mode),
      result: "added",
    };
  }

  if (mode === "append" && isItemCombinator(group.combinator)) {
    return {
      group: createRuleGroup("and", group.rules.length ? [group, rule] : [rule]),
      result: "added",
    };
  }

  if (mode === "replace-field") {
    return {
      group: withValueRule(group, rule),
      result: "added",
    };
  }

  if (mode === "flatten-field") {
    return {
      group: withFlattenedFieldRule(group, rule),
      result: "added",
    };
  }

  return {
    group: {
      ...group,
      rules: [...group.rules, rule],
    },
    result: "added",
  };
}
