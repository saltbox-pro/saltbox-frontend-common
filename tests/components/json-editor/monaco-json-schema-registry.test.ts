import { afterEach, describe, expect, it, vi } from "vitest";

import {
  acquireJsonEditorSchema,
  getJsonEditorSchemaRegistrySnapshotForTests,
  releaseJsonEditorSchema,
  resetJsonEditorSchemaRegistryForTests,
} from "../../../src/components/json-editor/utils/monaco-json-schema-registry";

function createMonacoMock() {
  let diagnosticsOptions = {
    schemas: [] as Array<{ uri: string; fileMatch?: string[]; schema?: object }>,
  };

  return {
    json: {
      jsonDefaults: {
        get diagnosticsOptions() {
          return diagnosticsOptions;
        },
        setDiagnosticsOptions: vi.fn((next) => {
          diagnosticsOptions = next;
        }),
      },
    },
  };
}

describe("monaco-json-schema-registry", () => {
  afterEach(() => {
    resetJsonEditorSchemaRegistryForTests();
  });

  it("keeps schema registered while ref-count > 0", async () => {
    const monaco = createMonacoMock();
    const registration = {
      uri: "inmemory://saltbox/test.schema.json",
      fileMatch: ["inmemory://saltbox/test.json"],
      schema: { type: "object" },
    };

    acquireJsonEditorSchema(monaco, registration);
    acquireJsonEditorSchema(monaco, registration);
    await Promise.resolve();

    expect(getJsonEditorSchemaRegistrySnapshotForTests()).toEqual({
      refCounts: { "inmemory://saltbox/test.schema.json": 2 },
      uris: ["inmemory://saltbox/test.schema.json"],
    });
    expect(monaco.json.jsonDefaults.setDiagnosticsOptions).toHaveBeenCalled();

    releaseJsonEditorSchema(monaco, registration.uri);
    await Promise.resolve();
    expect(getJsonEditorSchemaRegistrySnapshotForTests().refCounts).toEqual({
      "inmemory://saltbox/test.schema.json": 1,
    });

    releaseJsonEditorSchema(monaco, registration.uri);
    await Promise.resolve();
    expect(getJsonEditorSchemaRegistrySnapshotForTests()).toEqual({
      refCounts: {},
      uris: [],
    });
  });

  it("preserves foreign schemas when syncing managed ones", async () => {
    const monaco = createMonacoMock();
    monaco.json.jsonDefaults.setDiagnosticsOptions({
      schemas: [{ uri: "https://example.com/foreign.json", schema: { type: "string" } }],
    });

    acquireJsonEditorSchema(monaco, {
      uri: "inmemory://saltbox/owned.schema.json",
      fileMatch: ["inmemory://saltbox/owned.json"],
      schema: { type: "object" },
    });
    await Promise.resolve();

    const lastCall = monaco.json.jsonDefaults.setDiagnosticsOptions.mock.calls.at(-1)?.[0] as {
      schemas: Array<{ uri: string }>;
    };
    expect(lastCall.schemas.map((schema) => schema.uri)).toEqual([
      "https://example.com/foreign.json",
      "inmemory://saltbox/owned.schema.json",
    ]);
  });
});
