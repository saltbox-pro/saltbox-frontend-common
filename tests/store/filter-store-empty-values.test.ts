// @vitest-environment jsdom

import type { OptionList, RuleGroupType } from "react-querybuilder";
import { afterEach, describe, expect, it } from "vitest";

import { PersistentFilterStore } from "../../src/store/persistent-filter-store";

const fields: OptionList = [
  { name: "task_template.name", label: "Template name", ignoreEmptyValue: true },
  { name: "task_template.title", label: "Template", ignoreEmptyValue: true },
  { name: "user.name", label: "User" },
];
const blankFilters: RuleGroupType = {
  combinator: "and",
  rules: [{ field: "task_template.name", operator: "contains", value: "" }],
};

afterEach(() => localStorage.clear());

describe("FilterStore empty values", () => {
  it("does not enable search or count unapplied blank conditions", () => {
    const store = new PersistentFilterStore(fields);
    store.handleFiltersChange(blankFilters);

    expect(store.currentMongoDBQuery).toEqual({});
    expect(store.isSearchEnabled).toBe(false);
    store.handleSearch();
    expect(store.activeFiltersCount).toBe(0);
    expect(store.searchMongoDBQuery).toEqual({});
    expect(store.currentFilters.rules).toHaveLength(1);
  });

  it("allows clearing an applied condition by emptying its value", () => {
    const store = new PersistentFilterStore(fields);
    store.initializeByQuery({ "task_template.name": "Example" });
    store.handleFiltersChange(blankFilters);

    expect(store.isSearchEnabled).toBe(true);
    store.handleSearch();
    expect(store.searchMongoDBQuery).toEqual({});
    expect(store.activeFiltersCount).toBe(0);
    expect(store.isSearchEnabled).toBe(false);
  });

  it("ignores restored blank conditions when the schema arrives after storage", () => {
    localStorage.setItem("tasksFilter", JSON.stringify(blankFilters));
    const store = new PersistentFilterStore([], "tasksFilter");
    expect(store.searchMongoDBQuery).not.toEqual({});

    store.updateFilterSchema(fields);

    expect(store.searchMongoDBQuery).toEqual({});
    expect(store.currentMongoDBQuery).toEqual({});
    expect(store.activeFiltersCount).toBe(0);
    expect(store.isSearchEnabled).toBe(false);
  });

  it("restores filled conditions alongside ignored blank values and resets them", () => {
    const store = new PersistentFilterStore(fields, "policiesFilter");
    store.handleFiltersChange({
      ...blankFilters,
      rules: [
        ...blankFilters.rules,
        { field: "user.name", operator: "=", value: "Alex" },
        { field: "task_template.title", operator: "doesNotContain", value: "" },
      ],
    });
    store.handleSearch();

    const restored = new PersistentFilterStore(fields, "policiesFilter");
    expect(restored.searchMongoDBQuery).toEqual({ "user.name": { $regex: "(?i)^Alex$" } });
    expect(restored.activeFiltersCount).toBe(1);
    expect(restored.isSearchEnabled).toBe(false);

    restored.handleResetFilters();
    expect(restored.activeFiltersCount).toBe(0);
    expect(restored.currentMongoDBQuery).toEqual({});
    expect(restored.searchMongoDBQuery).toEqual({});
    expect(localStorage.getItem("policiesFilter")).toBeNull();
  });

  it("keeps explicit null checks when importing a MongoDB query", () => {
    const store = new PersistentFilterStore(fields);
    store.initializeByQuery({ "task_template.name": null });

    expect(store.searchMongoDBQuery).toEqual({ "task_template.name": null });
    expect(store.activeFiltersCount).toBe(1);
  });

  it("does not enable free-text search for an ignored blank condition", () => {
    const store = new PersistentFilterStore(fields);
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"task_template.name":""}');

    expect(store.freeTextBlockingErrorReason).toBeNull();
    expect(store.isSearchEnabled).toBe(false);
  });

  it("compares the effective free-text query after omitting blank conditions", () => {
    const store = new PersistentFilterStore(fields);
    store.initializeByQuery({ "user.name": "Alex" });
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"user.name":"Alex","task_template.title":""}');

    expect(store.isSearchEnabled).toBe(false);

    store.setFreeTextQuery('{"task_template.title":""}');
    expect(store.isSearchEnabled).toBe(true);
    expect(store.commitPendingInput()).toEqual({ ok: true });
    store.handleSearch();
    expect(store.searchMongoDBQuery).toEqual({});
    expect(store.isSearchEnabled).toBe(false);
  });
});
