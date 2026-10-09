import { describe, expect, it } from "vitest";

import { buildFilterByValueRule } from "../../src/utils/filter-by-value-rule";

const baseOptions = {
  supportsNull: false,
  isDatetime: false,
  isCheckbox: false,
  stringifyBoolean: false,
};

describe("buildFilterByValueRule", () => {
  it("keeps number values without stringifying", () => {
    expect(buildFilterByValueRule("grains.num_cpus", 4, baseOptions)).toEqual({
      field: "grains.num_cpus",
      operator: "=",
      value: 4,
    });
  });

  it("keeps boolean for checkbox fields", () => {
    expect(
      buildFilterByValueRule("grains.virtual", true, { ...baseOptions, isCheckbox: true })
    ).toEqual({
      field: "grains.virtual",
      operator: "=",
      value: true,
    });
  });

  it("stringifies boolean for select / booleanFromString fields", () => {
    expect(
      buildFilterByValueRule("flag", false, { ...baseOptions, stringifyBoolean: true })
    ).toEqual({
      field: "flag",
      operator: "=",
      value: "false",
    });
  });

  it("keeps string values as-is", () => {
    expect(buildFilterByValueRule("grains.id", "minion-1", baseOptions)).toEqual({
      field: "grains.id",
      operator: "=",
      value: "minion-1",
    });
  });
});
