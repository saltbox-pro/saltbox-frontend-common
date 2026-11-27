import type { OptionList, RuleGroupType, RuleType } from "react-querybuilder";
import { describe, expect, it } from "vitest";

import { defaultStringOperators } from "../../src/constants/filter-operators";
import {
  emptyRuleGroup,
  formatToMongoDB,
  omitEmptyFilterRules,
} from "../../src/utils/query-builder-utils";

const fields: OptionList = [
  { name: "task_template.title", label: "Template", ignoreEmptyValue: true },
  { name: "task_template.name", label: "Template name", ignoreEmptyValue: true },
  { name: "user.name", label: "User" },
];

const group = (...rules: RuleGroupType["rules"]): RuleGroupType => ({
  combinator: "and",
  rules,
});

const rule = (field: string, operator: string, value: unknown): RuleType => ({
  field,
  operator,
  value,
});

describe.each(["task_template.title", "task_template.name"])("empty %s filter", (field) => {
  it.each(
    defaultStringOperators.flatMap(({ name }) =>
      ["", null, undefined].map((value) => ({ operator: name, value }))
    )
  )("ignores $operator with value $value", ({ operator, value }) => {
    expect(formatToMongoDB(group(rule(field, operator, value)), fields)).toEqual({});
  });

  it.each(defaultStringOperators)("preserves filled $name conditions", ({ name }) => {
    const filters = group(rule(field, name, "Example.*"));
    const unconfiguredFields = fields.map((item) => ({ ...item, ignoreEmptyValue: false }));

    expect(formatToMongoDB(filters, fields)).toEqual(formatToMongoDB(filters, unconfiguredFields));
  });

  it.each(["null", "notNull"])("preserves the explicit %s operator", (operator) => {
    const filters = group(rule(field, operator, null));

    expect(omitEmptyFilterRules(filters, fields).rules).toEqual(filters.rules);
    expect(formatToMongoDB(filters, fields)).toEqual({
      [field]: operator === "null" ? null : { $ne: null },
    });
  });

  it.each([0, false, " "])("preserves the literal value %j", (value) => {
    const filters = group(rule(field, "=", value));

    expect(omitEmptyFilterRules(filters, fields).rules).toEqual(filters.rules);
  });
});

describe("empty filter groups", () => {
  const emptyRule = rule("task_template.name", "contains", "");
  const userRule = rule("user.name", "=", "Alex");

  it.each(["and", "or"])(
    "removes empty conditions from %s without discarding other rules",
    (combinator) => {
      const filters: RuleGroupType = {
        combinator,
        rules: [emptyRule, { ...group(emptyRule), not: true }, userRule],
      };

      expect(formatToMongoDB(filters, fields)).toEqual(formatToMongoDB(group(userRule), fields));
      expect(filters.rules).toHaveLength(3);
    }
  );

  it("preserves negation and the remaining nested conditions", () => {
    const filters = group({ ...group(emptyRule, userRule), not: true });

    expect(formatToMongoDB(filters, fields)).toEqual(
      formatToMongoDB(group({ ...group(userRule), not: true }), fields)
    );
  });

  it("ignores a negated root when all its conditions are blank", () => {
    expect(formatToMongoDB({ ...group(emptyRule), not: true }, fields)).toEqual({});
  });

  it("reads the policy from grouped field options", () => {
    expect(formatToMongoDB(group(emptyRule), [{ label: "Templates", options: fields }])).toEqual(
      {}
    );
  });

  it("keeps empty values for fields without the policy", () => {
    expect(formatToMongoDB(group(rule("user.name", "=", "")), fields)).toEqual({ "user.name": "" });
    expect(
      formatToMongoDB(group(emptyRule), [{ name: "task_template.name", label: "Name" }])
    ).toEqual({
      "task_template.name": { $regex: "(?i)" },
    });
  });

  it("preserves existing empty branches when no blank condition was removed", () => {
    const filters: RuleGroupType = { combinator: "or", rules: [group(), userRule] };
    expect(formatToMongoDB(filters, fields)).toEqual({
      $or: [{ $and: [{ $expr: true }] }, { "user.name": { $regex: "(?i)^Alex$" } }],
    });
  });

  it("serializes an empty root consistently, including the shared empty group", () => {
    expect(formatToMongoDB(group(), fields)).toEqual({});
    expect(formatToMongoDB(emptyRuleGroup, fields)).toEqual({});
  });

  it("does not treat field references as blank literal values", () => {
    const filters = group({ ...emptyRule, valueSource: "field" });

    expect(omitEmptyFilterRules(filters, fields).rules).toEqual(filters.rules);
  });
});
