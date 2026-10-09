import { describe, expect, it, vi } from "vitest";

import { FilterStore, freeTextErrorI18nKey } from "../../src/store/filter-store";
import { PersistentFilterStore } from "../../src/store/persistent-filter-store";
import * as queryBuilderUtils from "../../src/utils/query-builder-utils";

describe("FilterStore free-text validation", () => {
  it("does not block empty {} even with stale validation flag", () => {
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextHasValidationErrors(true);
    store.setFreeTextQuery("{}");

    expect(store.freeTextHasValidationErrors).toBe(false);
    expect(store.freeTextBlockingErrorReason).toBeNull();
    expect(store.commitPendingInput()).toEqual({ ok: true });
  });

  it("blocks invalid JSON in free-text mode", () => {
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery("{");

    expect(store.freeTextBlockingErrorReason).toBe("invalid-json");
    expect(store.isSearchEnabled).toBe(false);
    expect(store.commitPendingInput()).toEqual({ ok: false, reason: "invalid-json" });
  });

  it("blocks schema validation errors for non-empty queries", () => {
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"grains.id":"x"}');
    store.setFreeTextHasValidationErrors(true);

    expect(store.freeTextBlockingErrorReason).toBe("schema-validation");
    expect(store.commitPendingInput()).toEqual({ ok: false, reason: "schema-validation" });
  });

  it("blocks type mismatches synchronously without Monaco flag", () => {
    const store = new FilterStore();
    store.updateFilterSchema([{ name: "grains.num_cpus", label: "cpus", inputType: "number" }]);
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"grains.num_cpus":"4"}');

    expect(store.freeTextHasValidationErrors).toBe(false);
    expect(store.freeTextBlockingErrorReason).toBe("schema-validation");
    expect(store.commitPendingInput()).toEqual({ ok: false, reason: "schema-validation" });
    expect(store.freeTextHasValidationErrors).toBe(true);
  });

  it("blocks unparseable mongo live and on commit", () => {
    const spy = vi.spyOn(queryBuilderUtils, "filtersFromMongoQuery").mockReturnValue(null);
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"grains.id":"x"}');

    expect(store.freeTextBlockingErrorReason).toBe("unparseable");
    expect(store.isSearchEnabled).toBe(false);
    expect(store.commitPendingInput()).toEqual({ ok: false, reason: "unparseable" });
    spy.mockRestore();
  });

  it("maps failure reasons to i18n keys", () => {
    expect(freeTextErrorI18nKey("invalid-json")).toBe("query-builder.invalid-free-text-json");
    expect(freeTextErrorI18nKey("schema-validation")).toBe("query-builder.invalid-free-text");
    expect(freeTextErrorI18nKey("unparseable")).toBe("query-builder.invalid-free-text-for-builder");
  });

  it("bumps filtersRevision on successful free-text commit", () => {
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"grains.id":"minion-1"}');
    const revisionBefore = store.filtersRevision;

    expect(store.commitPendingInput()).toEqual({ ok: true });
    expect(store.filtersRevision).toBe(revisionBefore + 1);
    expect(store.currentFilters.rules.length).toBeGreaterThan(0);
  });

  it("bumps filtersRevision when committing empty free-text query", () => {
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"grains.id":"minion-1"}');
    expect(store.commitPendingInput()).toEqual({ ok: true });

    store.switchInputMode("free-text");
    store.setFreeTextQuery("{}");
    const revisionBefore = store.filtersRevision;

    expect(store.commitPendingInput()).toEqual({ ok: true });
    expect(store.filtersRevision).toBe(revisionBefore + 1);
    expect(store.currentFilters.rules).toHaveLength(0);
  });

  it("does not bump filtersRevision on failed commit", () => {
    const store = new FilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery("{");
    const revisionBefore = store.filtersRevision;

    expect(store.commitPendingInput()).toEqual({ ok: false, reason: "invalid-json" });
    expect(store.filtersRevision).toBe(revisionBefore);
  });
});

describe("PersistentFilterStore reset", () => {
  it("clears freeTextHasValidationErrors on reset", () => {
    const store = new PersistentFilterStore();
    store.switchInputMode("free-text");
    store.setFreeTextQuery('{"grains.id":"x"}');
    store.setFreeTextHasValidationErrors(true);

    store.handleResetFiltersSilent();

    expect(store.freeTextQuery).toBe("{}");
    expect(store.freeTextHasValidationErrors).toBe(false);
    expect(store.freeTextBlockingErrorReason).toBeNull();
  });

  it("initializeByQuery applies searchFilters via handleSearch", () => {
    const store = new PersistentFilterStore();

    store.initializeByQuery({ "grains.id": "minion-1" });

    expect(store.searchFilters.rules.length).toBeGreaterThan(0);
    expect(store.currentFilters.rules.length).toBe(store.searchFilters.rules.length);
  });
});
