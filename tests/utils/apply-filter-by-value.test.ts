import type { OptionList, RuleGroupType } from "react-querybuilder";
import { describe, expect, it } from "vitest";

import {
  applyFilterByValue,
  canApplyFilterByValue,
  hasFilterByValue,
} from "../../src/utils/apply-filter-by-value";
import {
  emptyRuleGroup,
  formatToMongoDB,
  filtersFromMongoQuery,
} from "../../src/utils/query-builder-utils";

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
    handleFiltersChange: (filters: RuleGroupType) => {
      currentFilters = filters;
      filtersRevision += 1;
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

  it.each(["andOnItem", "orOnItem"])(
    "keeps %s when adding cells from one category",
    (combinator) => {
      const name = "extra.inventory.softwares.name";
      const version = "extra.inventory.softwares.version";
      const disk = "extra.inventory.disks.name";
      const store = createStore(
        [name, version, disk].map((field) => ({ name: field, label: field }))
      );
      store.currentFilters = { combinator, rules: [] };

      applyFilterByValue(store, name, "3cpio");
      expect(store.currentFilters.combinator).toBe(combinator);
      applyFilterByValue(store, version, "0.14.0-1ubuntu1");
      const software = {
        [`$${combinator}`]: [{ [name]: "3cpio" }, { [version]: "0.14.0-1ubuntu1" }],
      };
      expect(formatToMongoDB(store.currentFilters)).toEqual(software);

      applyFilterByValue(store, disk, "disk-1");
      expect(formatToMongoDB(store.currentFilters)).toEqual({
        $and: [software, { [disk]: "disk-1" }],
      });
    }
  );

  it("builds nested andOnItem groups for related extra fields from an empty AND", () => {
    const name = "extra.inventory.softwares.name";
    const version = "extra.inventory.softwares.version";
    const printerName = "extra.inventory.printers.name";
    const printerModel = "extra.inventory.printers.model";
    const store = createStore(
      [name, version, printerName, printerModel, "grains.id"].map((field) => ({
        name: field,
        label: field,
      }))
    );

    applyFilterByValue(store, name, "AIDA64");
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      [name]: "AIDA64",
    });

    applyFilterByValue(store, version, "25.01");
    const software = {
      $andOnItem: [{ [name]: "AIDA64" }, { [version]: "25.01" }],
    };
    expect(formatToMongoDB(store.currentFilters)).toEqual(software);

    applyFilterByValue(store, printerName, "HP");
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $and: [software, { [printerName]: "HP" }],
    });

    applyFilterByValue(store, printerModel, "LaserJet");
    const printers = {
      $andOnItem: [{ [printerName]: "HP" }, { [printerModel]: "LaserJet" }],
    };
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $and: [software, printers],
    });

    applyFilterByValue(store, "grains.id", "minion-1");
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $and: [software, printers, { "grains.id": "minion-1" }],
    });
  });

  it("promotes flat same-category rules into andOnItem on the next related click", () => {
    const name = "extra.manual.software.name";
    const version = "extra.manual.software.version";
    const store = createStore([name, version].map((field) => ({ name: field, label: field })));
    store.currentFilters = {
      combinator: "and",
      not: false,
      rules: [
        {
          id: "1",
          field: name,
          operator: "=",
          valueSource: "value",
          value: "AIDA64",
        },
      ],
    };

    applyFilterByValue(store, version, "25.01");
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $andOnItem: [{ [name]: "AIDA64" }, { [version]: "25.01" }],
    });
  });

  it("keeps an existing OR separate from mandatory category predicates", () => {
    const name = "extra.manual.assets.name";
    const version = "extra.manual.assets.version";
    const os = "extra.manual.assets.os";
    const alternatives = { $orOnItem: [{ [name]: "apt" }, { [name]: "rpm" }] };
    const store = createStore();
    store.currentFilters = filtersFromMongoQuery({ $and: [alternatives, { [version]: "1" }] })!;
    applyFilterByValue(store, os, "linux");
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $and: [alternatives, { $andOnItem: [{ [version]: "1" }, { [os]: "linux" }] }],
    });
  });

  it("merges flat same-category rules into an existing andOnItem group", () => {
    const name = "extra.manual.software.name";
    const version = "extra.manual.software.version";
    const publisher = "extra.manual.software.publisher";
    const store = createStore(
      [name, version, publisher].map((field) => ({ name: field, label: field }))
    );
    store.currentFilters = {
      combinator: "and",
      not: false,
      rules: [
        {
          id: "flat",
          field: name,
          operator: "=",
          valueSource: "value",
          value: "AIDA64",
        },
        {
          combinator: "andOnItem",
          not: false,
          rules: [
            {
              id: "item",
              field: version,
              operator: "=",
              valueSource: "value",
              value: "25.01",
            },
          ],
        },
      ],
    };

    applyFilterByValue(store, publisher, "FinalWire");
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $andOnItem: [{ [version]: "25.01" }, { [name]: "AIDA64" }, { [publisher]: "FinalWire" }],
    });
  });

  it.each(["andOnItem", "orOnItem"])("keeps grain array filters outside %s", (combinator) => {
    const field = "grains.ipv4";
    const store = createStore();
    store.currentFilters = { combinator, rules: [] };
    applyFilterByValue(store, field, ["10.0.0.1", "10.0.0.2"]);
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      [field]: { $in: ["10.0.0.1", "10.0.0.2"] },
    });
  });

  it("adds a clicked value outside a negated item group", () => {
    const field = "extra.manual.assets.pkg";
    const negated = { $nor: [{ $andOnItem: [{ [field]: "apt" }] }] };
    const store = createStore();
    store.currentFilters = filtersFromMongoQuery(negated)!;
    expect(hasFilterByValue(store, field, "apt")).toBe(false);
    applyFilterByValue(store, field, "apt");
    expect(formatToMongoDB(store.currentFilters)).toEqual({ $and: [negated, { [field]: "apt" }] });
  });

  it("leaves a membership-only selector outside the item group", () => {
    const store = createStore([
      {
        name: "collection",
        label: "Collection",
        operators: [
          { name: "in", label: "In" },
          { name: "notIn", label: "Not in" },
        ],
      },
    ]);
    store.currentFilters = { combinator: "andOnItem", rules: [] };
    applyFilterByValue(store, "collection", ["team-a"]);
    expect(store.currentFilters.combinator).toBe("and");
  });

  it("preserves ordinary numeric membership for Salt version components", () => {
    const field = "grains.saltversioninfo";
    const store = createStore([
      {
        name: field,
        label: field,
        operators: [
          { name: "in", label: "In" },
          { name: "notIn", label: "Not in" },
          { name: "null", label: "Null" },
          { name: "notNull", label: "Not null" },
        ],
      },
    ]);
    store.currentFilters = { combinator: "andOnItem", rules: [] };
    applyFilterByValue(store, field, [3008, 5], { mode: "replace-field", search: true });
    expect(formatToMongoDB(store.currentFilters, store.filterSchema)).toEqual({
      [field]: { $in: [3008, 5] },
    });
    expect(store.searchCalls).toBe(1);
  });

  it.each(["$andOnItem", "$orOnItem"])("applies a cell filter outside %s", (operator) => {
    const store = createStore([{ name: "grains.id", label: "ID" }]);
    const software = {
      [operator]: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    };
    store.currentFilters = filtersFromMongoQuery(software)!;
    applyFilterByValue(store, "grains.id", "minion-1", { search: true });
    expect(store.searchCalls).toBe(1);
    expect(formatToMongoDB(store.currentFilters)).toEqual({
      $and: [software, { "grains.id": "minion-1" }],
    });

    applyFilterByValue(store, "grains.id", "minion-1", { search: true });
    expect(formatToMongoDB(store.currentFilters)).toEqual(software);
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
