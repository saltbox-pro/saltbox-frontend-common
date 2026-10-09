import { describe, expect, it } from "vitest";

import { buildFreeTextFilterJsonSchema } from "../../src/utils/query-builder-utils";

function getFilterClauseProperties(schema: Record<string, unknown>) {
  return (
    schema.definitions as {
      filterClause: { properties: Record<string, Record<string, unknown>> };
    }
  ).filterClause.properties;
}

function typedValueSchema(jsonType: "number" | "boolean" | "string") {
  const scalar = { type: jsonType };
  const properties: Record<string, unknown> = {
    $eq: scalar,
    $ne: scalar,
    $gt: scalar,
    $gte: scalar,
    $lt: scalar,
    $lte: scalar,
    $in: { type: "array", items: scalar, minItems: 1 },
    $nin: { type: "array", items: scalar, minItems: 1 },
    $not: { type: "object", minProperties: 1 },
  };
  if (jsonType === "string") {
    properties.$regex = { type: "string" };
  }

  return {
    anyOf: [
      scalar,
      { type: "null" },
      {
        type: "object",
        minProperties: 1,
        additionalProperties: false,
        properties,
      },
    ],
  };
}

describe("buildFreeTextFilterJsonSchema", () => {
  it("maps every schema field to a typed value schema with known operators", () => {
    const schema = buildFreeTextFilterJsonSchema([
      { name: "grains.id", label: "id" },
      { name: "grains.num_cpus", label: "cpus", inputType: "number" },
      { name: "grains.virtual", label: "virtual", valueEditorType: "checkbox" },
      { name: "last_activity", label: "last", inputType: "datetime-local" },
    ]);

    const properties = getFilterClauseProperties(schema);

    expect(properties["grains.id"]).toEqual(typedValueSchema("string"));
    expect(properties["grains.num_cpus"]).toEqual(typedValueSchema("number"));
    expect(properties["grains.virtual"]).toEqual(typedValueSchema("boolean"));
    expect(properties.last_activity).toEqual(typedValueSchema("string"));
    expect(properties.$and).toMatchObject({ type: "array", minItems: 1 });
    expect(properties.$or).toMatchObject({ type: "array", minItems: 1 });
    expect(properties.$nor).toBe(false);
  });

  it("rejects unknown operators via additionalProperties: false", () => {
    const schema = buildFreeTextFilterJsonSchema([
      { name: "grains.num_cpus", label: "cpus", inputType: "number" },
    ]);

    const valueSchema = getFilterClauseProperties(schema)["grains.num_cpus"] as {
      anyOf: Array<{ type?: string; additionalProperties?: boolean; properties?: unknown }>;
    };

    const operatorSchema = valueSchema.anyOf.find((item) => item.type === "object");
    expect(operatorSchema?.additionalProperties).toBe(false);
    expect(operatorSchema?.properties).toMatchObject({
      $eq: { type: "number" },
      $in: { type: "array", items: { type: "number" }, minItems: 1 },
    });
  });
});
