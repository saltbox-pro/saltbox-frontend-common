import { describe, expect, it } from "vitest";

import { filtersFromMongoQuery, isMongoQueryEmpty } from "../../src/utils/query-builder-utils";

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

  it("returns null for bare arrays that parseMongoDB drops", () => {
    expect(filtersFromMongoQuery({ "grains.num_cpus": [444] })).toBeNull();
  });

  it("returns null for operators that parseMongoDB drops", () => {
    expect(filtersFromMongoQuery({ "grains.num_cpus": { $exists: true } })).toBeNull();
    expect(filtersFromMongoQuery({ "grains.num_cpus": {} })).toBeNull();
  });

  it("parses $in arrays", () => {
    const filters = filtersFromMongoQuery({ "grains.num_cpus": { $in: [444] } });
    expect(filters).not.toBeNull();
    expect(filters?.rules.length).toBeGreaterThan(0);
  });
});
