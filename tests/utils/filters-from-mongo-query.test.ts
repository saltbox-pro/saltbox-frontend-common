import { isRuleGroupType } from "react-querybuilder";
import { describe, expect, it } from "vitest";

import {
  filtersFromMongoQuery,
  formatToMongoDB,
  hasMongoItemOperatorShell,
  ITEM_COMBINATOR_AND,
  ITEM_COMBINATOR_OR,
  isMongoQueryEmpty,
} from "../../src/utils/query-builder-utils";

describe("filtersFromMongoQuery", () => {
  it("returns empty rule group for {}", () => {
    const filters = filtersFromMongoQuery({});
    expect(filters).not.toBeNull();
    expect(filters?.rules).toEqual([]);
  });

  it("parses a simple equality query", () => {
    const filters = filtersFromMongoQuery({ "grains.id": "minion-1" });
    expect(filters).not.toBeNull();
    expect(filters?.rules.length).toBeGreaterThan(0);
  });

  it("treats empty mongo query as empty filters", () => {
    expect(isMongoQueryEmpty({})).toBe(true);
    expect(filtersFromMongoQuery({})?.rules).toEqual([]);
  });

  it.each(["$andOnItem", "$orOnItem"])(
    "rejects an empty %s without treating it as a reset",
    (operator) => {
      expect(isMongoQueryEmpty({ [operator]: [] })).toBe(false);
      expect(filtersFromMongoQuery({ [operator]: [] })).toBeNull();
    }
  );

  it.each(["$andOnItem", "$orOnItem"])("detects nested empty %s shells inside $and", (operator) => {
    expect(hasMongoItemOperatorShell({ [operator]: [] })).toBe(true);
    expect(hasMongoItemOperatorShell({ $and: [{ [operator]: [] }] })).toBe(true);
    expect(hasMongoItemOperatorShell({ $and: [{ "grains.id": "minion-1" }] })).toBe(false);
  });

  it("returns null for bare arrays that parseMongoDB drops", () => {
    expect(filtersFromMongoQuery({ "grains.num_cpus": [444] })).toBeNull();
  });

  it("returns null for operators that parseMongoDB drops", () => {
    expect(filtersFromMongoQuery({ "grains.num_cpus": { $exists: true } })).toBeNull();
    expect(filtersFromMongoQuery({ "grains.num_cpus": {} })).toBeNull();
  });

  it("rejects a predicate with an unsupported operator inside $not", () => {
    const invalid = { count: { $not: { $gte: 2, $exists: true } } };
    const item = { $andOnItem: [{ "extra.manual.assets.pkg": "apt" }] };

    expect(filtersFromMongoQuery(invalid)).toBeNull();
    expect(filtersFromMongoQuery({ ...item, ...invalid })).toBeNull();
    expect(filtersFromMongoQuery({ count: { $not: { $gte: 2 } } })).not.toBeNull();
  });

  it("parses $in arrays", () => {
    const filters = filtersFromMongoQuery({ "grains.num_cpus": { $in: [444] } });
    expect(filters).not.toBeNull();
    expect(filters?.rules.length).toBeGreaterThan(0);
  });

  it("parses $andOnItem into andOnItem combinator", () => {
    const filters = filtersFromMongoQuery({
      $andOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    });

    expect(filters?.combinator).toBe(ITEM_COMBINATOR_AND);
    expect(filters?.rules).toHaveLength(2);
  });

  it("parses $orOnItem into orOnItem combinator", () => {
    const filters = filtersFromMongoQuery({
      $orOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.name": "apt" },
      ],
    });

    expect(filters?.combinator).toBe(ITEM_COMBINATOR_OR);
    expect(filters?.rules).toHaveLength(2);
  });

  it("restores nested $andOnItem inside $and", () => {
    const filters = filtersFromMongoQuery({
      $and: [
        {
          $andOnItem: [
            { "extra.manual.software.name": "AIDA64" },
            { "extra.manual.software.version": "25.01" },
          ],
        },
        { "grains.id": "minion-1" },
      ],
    });

    expect(filters?.combinator).toBe("and");
    expect(filters?.rules).toHaveLength(2);
    expect(isRuleGroupType(filters!.rules[0])).toBe(true);
    if (isRuleGroupType(filters!.rules[0])) {
      expect(filters!.rules[0].combinator).toBe(ITEM_COMBINATOR_AND);
    }
  });

  it("preserves item boundaries around a range after reopening a filter", () => {
    const field = "extra.inventory.disks.size";
    const query = {
      $and: [{ $andOnItem: [{ [field]: { $gte: 1 } }, { [field]: { $lte: 4 } }] }, { id: 1 }],
    };
    const fields = [field, "id"].map((name) => ({ name, label: name, inputType: "number" }));
    expect(formatToMongoDB(filtersFromMongoQuery(query)!, fields)).toEqual(query);
  });

  it("preserves a nested item group next to a compound field predicate", () => {
    const item = {
      $orOnItem: [{ "extra.inventory.disks.name": "A" }, { "extra.inventory.disks.name": "B" }],
    };
    const query = { cpus: { $gt: 1, $lt: 9 }, $or: [item, { id: 1 }] };
    const fields = ["cpus", "id"].map((name) => ({ name, label: name, inputType: "number" }));
    expect(formatToMongoDB(filtersFromMongoQuery(query)!, fields)).toEqual({
      $and: [{ $and: [{ cpus: { $gt: 1 } }, { cpus: { $lt: 9 } }] }, { $or: query.$or }],
    });
  });

  it("round-trips andOnItem / orOnItem through formatToMongoDB", () => {
    const andOnItemQuery = {
      $andOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    };
    const orOnItemQuery = {
      $orOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    };

    const andFilters = filtersFromMongoQuery(andOnItemQuery);
    const orFilters = filtersFromMongoQuery(orOnItemQuery);

    expect(andFilters).not.toBeNull();
    expect(orFilters).not.toBeNull();
    expect(formatToMongoDB(andFilters!)).toEqual(andOnItemQuery);
    expect(formatToMongoDB(orFilters!)).toEqual(orOnItemQuery);
  });

  it("keeps $andOnItem wrapper for a single-rule group", () => {
    const query = {
      $andOnItem: [{ "extra.manual.software.name": "AIDA64" }],
    };

    const filters = filtersFromMongoQuery(query);
    expect(filters?.combinator).toBe(ITEM_COMBINATOR_AND);
    expect(filters?.rules).toHaveLength(1);
    expect(formatToMongoDB(filters!)).toEqual(query);
  });

  it("round-trips nested single-rule $andOnItem inside $and", () => {
    const query = {
      $and: [
        { $andOnItem: [{ "extra.manual.software.name": "AIDA64" }] },
        { "grains.id": "minion-1" },
      ],
    };

    const filters = filtersFromMongoQuery(query);
    expect(filters).not.toBeNull();
    expect(formatToMongoDB(filters!)).toEqual(query);
  });

  it("restores $andOnItem next to a field predicate", () => {
    const filters = filtersFromMongoQuery({
      "grains.id": "minion-1",
      $andOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    });

    expect(filters?.combinator).toBe("and");
    expect(filters?.rules).toHaveLength(2);
    const itemGroup = filters?.rules.find(isRuleGroupType);
    expect(itemGroup?.combinator).toBe(ITEM_COMBINATOR_AND);
  });

  it("keeps both branches when $and and $andOnItem are siblings", () => {
    const filters = filtersFromMongoQuery({
      $and: [{ "grains.id": "minion-1" }],
      $andOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    });

    expect(filters?.combinator).toBe("and");
    expect(filters?.rules).toHaveLength(2);
    const itemGroup = filters?.rules.find(isRuleGroupType);
    expect(itemGroup?.combinator).toBe(ITEM_COMBINATOR_AND);
    expect(itemGroup?.rules).toHaveLength(2);
    expect(formatToMongoDB(filters!)).toEqual({
      $and: [
        { "grains.id": "minion-1" },
        {
          $andOnItem: [
            { "extra.manual.software.name": "AIDA64" },
            { "extra.manual.software.version": "25.01" },
          ],
        },
      ],
    });
  });

  it("requires both sibling OR branches after reopening the filter", () => {
    const hosts = { $or: [{ "grains.id": "minion-1" }, { "grains.id": "minion-2" }] };
    const software = {
      $orOnItem: [
        { "extra.manual.software.name": "AIDA64" },
        { "extra.manual.software.version": "25.01" },
      ],
    };

    const filters = filtersFromMongoQuery({ ...hosts, ...software });
    expect(filters?.combinator).toBe("and");
    expect(formatToMongoDB(filters!)).toEqual({ $and: [hosts, software] });
  });

  it("preserves group negation next to an item group", () => {
    const filters = {
      combinator: "and" as const,
      not: false,
      rules: [
        {
          combinator: "and" as const,
          not: true,
          rules: [{ field: "grains.id", operator: "=", value: "minion-1" }],
        },
        {
          combinator: ITEM_COMBINATOR_AND,
          not: false,
          rules: [{ field: "extra.manual.software.name", operator: "=", value: "AIDA64" }],
        },
      ],
    };

    expect(formatToMongoDB(filters)).toEqual({
      $and: [
        { $nor: [{ "grains.id": "minion-1" }] },
        { $andOnItem: [{ "extra.manual.software.name": "AIDA64" }] },
      ],
    });
  });

  it("negates the union of NOR branches and cancels double negation", () => {
    const item = { $orOnItem: [{ "extra.manual.assets.name": "apt" }] };
    const other = { "grains.id": "machine" };
    const multi = filtersFromMongoQuery({ $nor: [item, other] })!;
    expect(formatToMongoDB(multi)).toEqual({ $nor: [{ $or: [item, other] }] });
    expect(formatToMongoDB(filtersFromMongoQuery({ $nor: [{ $nor: [item] }] })!)).toEqual(item);
  });

  it("round-trips $nor wrapping an item group", () => {
    const query = {
      $nor: [
        {
          $andOnItem: [
            { "extra.manual.software.name": "AIDA64" },
            { "extra.manual.software.version": "25.01" },
          ],
        },
      ],
    };

    const filters = filtersFromMongoQuery(query);
    expect(filters?.not).toBe(true);
    expect(filters?.combinator).toBe(ITEM_COMBINATOR_AND);
    expect(formatToMongoDB(filters!)).toEqual(query);
  });

  it("preserves negation for a group without item combinators", () => {
    expect(
      formatToMongoDB({
        combinator: "and",
        not: true,
        rules: [
          { field: "grains.id", operator: "=", value: "minion-1" },
          { field: "grains.os", operator: "=", value: "linux" },
        ],
      })
    ).toEqual({
      $nor: [{ $and: [{ "grains.id": "minion-1" }, { "grains.os": "linux" }] }],
    });
  });
});
