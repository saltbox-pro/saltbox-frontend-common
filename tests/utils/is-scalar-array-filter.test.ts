import { describe, expect, it } from "vitest";

import { isScalarArrayFilter } from "../../src/utils/filter-schema-field";

const membershipOperators = [
  { name: "in", label: "In" },
  { name: "notIn", label: "Not in" },
  { name: "null", label: "Null" },
  { name: "notNull", label: "Not null" },
];

describe("isScalarArrayFilter", () => {
  it("detects the membership operator set", () => {
    expect(
      isScalarArrayFilter({
        name: "grains.ipv4",
        operators: membershipOperators,
      })
    ).toBe(true);
  });

  it("honours an explicit isScalarArray flag over operators", () => {
    expect(
      isScalarArrayFilter({
        name: "collection",
        isScalarArray: true,
        operators: [
          { name: "in", label: "In" },
          { name: "notIn", label: "Not in" },
          { name: "contains", label: "contains" },
        ],
      })
    ).toBe(true);

    expect(
      isScalarArrayFilter({
        name: "grains.ipv4",
        isScalarArray: false,
        operators: membershipOperators,
      })
    ).toBe(false);
  });
});
