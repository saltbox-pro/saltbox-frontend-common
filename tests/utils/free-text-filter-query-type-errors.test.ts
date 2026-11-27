import { describe, expect, it } from "vitest";

import { freeTextFilterQueryHasTypeErrors } from "../../src/utils/query-builder-utils";

describe("freeTextFilterQueryHasTypeErrors", () => {
  const fields = [
    { name: "grains.id", label: "id" },
    { name: "grains.num_cpus", label: "cpus", inputType: "number" },
    { name: "grains.virtual", label: "virtual", valueEditorType: "checkbox" },
  ];

  it("accepts values matching field types", () => {
    expect(
      freeTextFilterQueryHasTypeErrors(
        {
          "grains.id": "minion-1",
          "grains.num_cpus": 4,
          "grains.virtual": true,
        },
        fields
      )
    ).toBe(false);
  });

  it("rejects scalar type mismatches for known fields", () => {
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": "4" }, fields)).toBe(true);
    expect(freeTextFilterQueryHasTypeErrors({ "grains.virtual": "true" }, fields)).toBe(true);
    expect(freeTextFilterQueryHasTypeErrors({ "grains.id": 1 }, fields)).toBe(true);
  });

  it("rejects bare arrays that parseMongoDB cannot round-trip", () => {
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": [444] }, fields)).toBe(true);
  });

  it("accepts typed comparison and list operators", () => {
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $gt: 2 } }, fields)).toBe(false);
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $in: [444] } }, fields)).toBe(
      false
    );
    expect(freeTextFilterQueryHasTypeErrors({ "grains.id": { $regex: "minion" } }, fields)).toBe(
      false
    );
    expect(
      freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $not: { $eq: 1 } } }, fields)
    ).toBe(false);
    expect(freeTextFilterQueryHasTypeErrors({ "custom.grain": 123 }, fields)).toBe(false);
  });

  it("rejects operator operands with wrong types", () => {
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $gt: "2" } }, fields)).toBe(
      true
    );
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $in: ["444"] } }, fields)).toBe(
      true
    );
    expect(freeTextFilterQueryHasTypeErrors({ "grains.id": { $regex: 1 } }, fields)).toBe(true);
  });

  it("rejects operators that parseMongoDB drops silently", () => {
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $exists: true } }, fields)).toBe(
      true
    );
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": {} }, fields)).toBe(true);
    expect(freeTextFilterQueryHasTypeErrors({ "grains.num_cpus": { $unknown: 1 } }, fields)).toBe(
      true
    );
  });

  it("rejects partial $and when any clause is unparseable", () => {
    expect(
      freeTextFilterQueryHasTypeErrors(
        {
          $and: [{ "grains.num_cpus": [444] }, { "grains.id": "minion-1" }],
        },
        fields
      )
    ).toBe(true);
  });

  it("treats empty $and as an empty query (no type errors)", () => {
    expect(freeTextFilterQueryHasTypeErrors({ $and: [] }, fields)).toBe(false);
  });

  it("checks nested $and / $or clauses", () => {
    expect(
      freeTextFilterQueryHasTypeErrors(
        {
          $and: [{ "grains.num_cpus": "4" }],
        },
        fields
      )
    ).toBe(true);
  });

  it.each(["$andOnItem", "$orOnItem"])("validates item boundaries inside %s", (operator) => {
    const pkg = { "extra.manual.assets.pkg": "apt" };
    const version = { "extra.manual.assets.version": 2 };
    const disk = { "extra.manual.disks.name": "sda" };
    expect(
      freeTextFilterQueryHasTypeErrors({ [operator]: [pkg, { $nor: [version] }] }, fields)
    ).toBe(false);
    for (const condition of [disk, { $or: [version, disk] }, { $andOnItem: [pkg] }]) {
      expect(freeTextFilterQueryHasTypeErrors({ [operator]: [pkg, condition] }, fields)).toBe(true);
    }
    expect(
      freeTextFilterQueryHasTypeErrors(
        { $and: [{ [operator]: [pkg] }, { [operator]: [disk] }] },
        fields
      )
    ).toBe(false);
  });

  it("rejects type mismatches inside $andOnItem / $orOnItem", () => {
    expect(
      freeTextFilterQueryHasTypeErrors(
        {
          $andOnItem: [{ "grains.num_cpus": "4" }],
        },
        fields
      )
    ).toBe(true);
    expect(
      freeTextFilterQueryHasTypeErrors(
        {
          $orOnItem: [{ "grains.num_cpus": [444] }],
        },
        fields
      )
    ).toBe(true);
  });
});
