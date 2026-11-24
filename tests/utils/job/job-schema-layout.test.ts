import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  getJobParamsSchemaLayout,
  omitExtraFormDataBySchema,
  readJsonFormData,
  type JsonSchemaRecord,
  type UiSchemaRecord,
} from "../../../src/utils/job/job-schema-split";

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), "../../fixtures");

const loadSchema = (relativePath: string): JsonSchemaRecord =>
  JSON.parse(readFileSync(join(fixturesRoot, relativePath), "utf8")) as JsonSchemaRecord;

const templateSchema = {
  type: "object",
  properties: {
    kwargs: {
      type: "object",
      properties: {
        pillar: {
          type: "object",
          required: ["action"],
          properties: {
            action: { type: "string", enum: ["install", "remove"] },
            timeout: { type: "integer", minimum: 1, default: 30 },
            extra: {
              type: "object",
              properties: {
                comment: { type: "string" },
              },
            },
          },
          if: { properties: { action: { const: "install" } } },
          then: { properties: { packages: { type: "array", items: { type: "string" } } } },
          else: { properties: { purge: { type: "boolean" } } },
        },
      },
    },
  },
} as JsonSchemaRecord;

const templateUiSchema: UiSchemaRecord = {
  kwargs: {
    pillar: {
      "ui:order": ["action", "*"],
      timeout: { "ui:title": "Timeout", "ui:widget": "updown" },
    },
  },
};

const getPillarUiSchema = (uiSchema: UiSchemaRecord | undefined) =>
  (uiSchema?.kwargs as UiSchemaRecord).pillar as UiSchemaRecord;

const getVisiblePillarProperties = (schema: JsonSchemaRecord | null) => {
  const kwargs = (schema?.properties as JsonSchemaRecord).kwargs as JsonSchemaRecord;
  const pillar = (kwargs.properties as JsonSchemaRecord).pillar as JsonSchemaRecord;
  return pillar.properties as JsonSchemaRecord;
};

describe("getJobParamsSchemaLayout", () => {
  it("renders the full schema and hides optional fields via uiSchema in basic mode", () => {
    const layout = getJobParamsSchemaLayout(templateSchema, templateUiSchema, false);

    expect(layout.displaySchema).toBe(templateSchema);

    const pillarUiSchema = getPillarUiSchema(layout.displayUiSchema);
    expect(pillarUiSchema["ui:order"]).toEqual(["action", "*"]);
    expect(pillarUiSchema.timeout).toEqual({ "ui:title": "Timeout", "ui:widget": "hidden" });
    expect(pillarUiSchema.extra).toEqual({ "ui:widget": "hidden" });
    expect(pillarUiSchema.action).toBeUndefined();
    expect(pillarUiSchema.packages).toBeUndefined();
    expect(pillarUiSchema.purge).toBeUndefined();
  });

  it("keeps the required subset as visibleSchema in basic mode", () => {
    const layout = getJobParamsSchemaLayout(templateSchema, templateUiSchema, false);

    expect(Object.keys(getVisiblePillarProperties(layout.visibleSchema))).toEqual(["action"]);
  });

  it("does not mark anything inside a required object", () => {
    const schema: JsonSchemaRecord = { ...templateSchema, required: ["kwargs"] };

    const layout = getJobParamsSchemaLayout(schema, templateUiSchema, false);

    expect(layout.displayUiSchema).toEqual(templateUiSchema);
    expect(layout.visibleSchema).toEqual(schema);
  });

  it("shows the full schema with the original uiSchema in advanced mode", () => {
    const layout = getJobParamsSchemaLayout(templateSchema, templateUiSchema, true);

    expect(layout).toEqual({
      displaySchema: templateSchema,
      displayUiSchema: templateUiSchema,
      visibleSchema: templateSchema,
    });
  });

  it("has no visible schema when nothing is required", () => {
    const schema = {
      type: "object",
      properties: { kwargs: { type: "object", properties: { name: { type: "string" } } } },
    } as JsonSchemaRecord;

    const layout = getJobParamsSchemaLayout(schema, undefined, false);

    expect(layout.displaySchema).toBe(schema);
    expect(layout.visibleSchema).toBeNull();
    expect(layout.displayUiSchema).toEqual({ kwargs: { "ui:widget": "hidden" } });
  });
});

describe("omitExtraFormDataBySchema", () => {
  it("drops fields of the inactive branch and keeps hidden optional fields", () => {
    expect(
      omitExtraFormDataBySchema(
        { kwargs: { pillar: { action: "remove", timeout: 30, packages: ["vim"] } } },
        templateSchema
      )
    ).toEqual({
      kwargs: { pillar: { action: "remove", timeout: 30 } },
    });
  });

  it("keeps fields of the active branch", () => {
    expect(
      omitExtraFormDataBySchema(
        { kwargs: { pillar: { action: "install", timeout: 30, packages: ["vim"] } } },
        templateSchema
      )
    ).toEqual({
      kwargs: { pillar: { action: "install", timeout: 30, packages: ["vim"] } },
    });
  });

  it("drops fields of the previous action in a dependencies/oneOf template", () => {
    const schema = loadSchema("base-windows/services-init.schema.json");

    expect(
      omitExtraFormDataBySchema(
        {
          kwargs: {
            pillar: {
              action: "delete",
              name: "MySvc",
              state: "start",
              bin_path: "C:\\Program Files\\MyApp\\service.exe",
            },
          },
        },
        schema
      )
    ).toEqual({ kwargs: { pillar: { action: "delete", name: "MySvc" } } });
  });

  it("returns formData unchanged when schema is missing", () => {
    const formData = { kwargs: { pillar: { action: "remove", packages: ["vim"] } } };
    expect(omitExtraFormDataBySchema(formData, null)).toBe(formData);
  });
});

describe("readJsonFormData", () => {
  it("prefers form state formData over fallback", () => {
    const fallback = { kwargs: { pillar: { action: "install" } } };
    expect(
      readJsonFormData(
        { state: { formData: { kwargs: { pillar: { action: "remove" } } } } },
        fallback
      )
    ).toEqual({ kwargs: { pillar: { action: "remove" } } });
  });

  it("uses fallback when form state is missing", () => {
    const fallback = { kwargs: { pillar: { action: "install" } } };
    expect(readJsonFormData(null, fallback)).toBe(fallback);
    expect(readJsonFormData({ state: { formData: null } }, fallback)).toBe(fallback);
  });
});

describe("hideOmittedProperties via getJobParamsSchemaLayout", () => {
  it("recurses into a partially visible object by property keys, not by reference", () => {
    const schema = {
      type: "object",
      properties: {
        kwargs: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            options: {
              type: "object",
              properties: {
                verbose: { type: "boolean" },
              },
            },
          },
        },
      },
    } as JsonSchemaRecord;

    const layout = getJobParamsSchemaLayout(schema, undefined, false);
    const kwargsUi = layout.displayUiSchema?.kwargs as UiSchemaRecord;

    expect(kwargsUi.name).toBeUndefined();
    expect(kwargsUi.options).toEqual({ "ui:widget": "hidden" });
  });
});
