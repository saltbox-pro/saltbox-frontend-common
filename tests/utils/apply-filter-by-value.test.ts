import type { OptionList, RuleGroupType } from "react-querybuilder";
import { describe, expect, it } from "vitest";

import {
  applyFilterByValue,
  canApplyFilterByValue,
  hasFilterByValue,
} from "../../src/utils/apply-filter-by-value";
import { emptyRuleGroup } from "../../src/utils/query-builder-utils";

function createStore(schema: OptionList = []) {
  let currentFilters: RuleGroupType = emptyRuleGroup;
  let filtersRevision = 0;
  let searchCalls = 0;

  return {
    filterSchema: schema,
    get currentFilters() {
      return currentFilters;
    },
    set currentFilters(value: RuleGroupType) {
      currentFilters = value;
    },
    get filtersRevision() {
      return filtersRevision;
    },
    get searchCalls() {
      return searchCalls;
    },
    bumpFiltersRevision: () => {
      filtersRevision += 1;
    },
    handleFiltersChange: (filters: RuleGroupType) => {
      currentFilters = filters;
    },
    handleSearch: () => {
      searchCalls += 1;
    },
  };
}

describe("applyFilterByValue", () => {
  it("adds, toggles off, and bumps revision", () => {
    const store = createStore([{ name: "status", label: "Status" }]);

    expect(canApplyFilterByValue(store, "status", "ok")).toBe(true);

    const added = applyFilterByValue(store, "status", "ok");
    expect(added).toEqual({ ok: true, result: "added" });
    expect(hasFilterByValue(store, "status", "ok")).toBe(true);
    expect(store.filtersRevision).toBe(1);
    expect(store.searchCalls).toBe(0);

    const removed = applyFilterByValue(store, "status", "ok");
    expect(removed).toEqual({ ok: true, result: "removed" });
    expect(hasFilterByValue(store, "status", "ok")).toBe(false);
    expect(store.filtersRevision).toBe(2);
  });

  it("calls handleSearch when search option is enabled", () => {
    const store = createStore([{ name: "fun", label: "Function" }]);

    applyFilterByValue(store, "fun", "test.ping", { search: true });

    expect(store.searchCalls).toBe(1);
  });

  it("returns unsupported for non-primitive values", () => {
    const store = createStore([{ name: "details", label: "Details" }]);

    expect(applyFilterByValue(store, "details", { nested: true })).toEqual({
      ok: false,
      reason: "unsupported",
    });
    expect(store.filtersRevision).toBe(0);
  });

  it("replace-field mode replaces other values of the same field", () => {
    const store = createStore([{ name: "status", label: "Status" }]);

    applyFilterByValue(store, "status", "ok", { mode: "append" });
    applyFilterByValue(store, "status", "error", { mode: "replace-field" });

    expect(hasFilterByValue(store, "status", "ok")).toBe(false);
    expect(hasFilterByValue(store, "status", "error")).toBe(true);
  });
});
