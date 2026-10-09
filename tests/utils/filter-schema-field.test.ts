import { describe, expect, it } from "vitest";

import {
  findFilterSchemaField,
  flattenFilterSchemaFields,
  getFilterFieldOptions,
} from "../../src/utils/filter-schema-field";

describe("filter-schema-field", () => {
  const schema = [
    {
      label: "group",
      options: [
        { name: "select_flag", label: "s", valueEditorType: "select" },
        {
          name: "coerced_flag",
          label: "c",
          mongoValueCoercion: "booleanFromString",
        },
      ],
    },
    { name: "checkbox_flag", label: "b", valueEditorType: "checkbox" },
    { name: "grains.num_cpus", label: "cpus", inputType: "number" },
  ];

  it("flattens nested option groups", () => {
    expect(flattenFilterSchemaFields(schema).map((field) => field.name)).toEqual([
      "select_flag",
      "coerced_flag",
      "checkbox_flag",
      "grains.num_cpus",
    ]);
  });

  it("finds nested fields", () => {
    expect(findFilterSchemaField(schema, "coerced_flag")).toMatchObject({
      name: "coerced_flag",
      mongoValueCoercion: "booleanFromString",
    });
    expect(findFilterSchemaField(schema, "missing")).toBeUndefined();
  });

  it("marks select and booleanFromString fields as stringifyBoolean", () => {
    expect(getFilterFieldOptions(schema, "select_flag").stringifyBoolean).toBe(true);
    expect(getFilterFieldOptions(schema, "coerced_flag").stringifyBoolean).toBe(true);
    expect(getFilterFieldOptions(schema, "checkbox_flag").stringifyBoolean).toBe(false);
    expect(getFilterFieldOptions(schema, "checkbox_flag").isCheckbox).toBe(true);
  });
});
