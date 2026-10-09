import { describe, expect, it } from "vitest";

import {
  getFreeTextFilterJsonSchemaRegistration,
  getFreeTextFilterModelPath,
} from "../../../src/components/query-builder/utils/free-text-filter-json-schema";

describe("free-text filter monaco paths", () => {
  it("builds unique model paths without numeric collisions", () => {
    const left = getFreeTextFilterModelPath("a", 2, 3);
    const right = getFreeTextFilterModelPath("a", 4, 1);

    expect(left).not.toBe(right);
    expect(left).toContain("-2-3.json");
    expect(right).toContain("-4-1.json");
  });

  it("uses a unique schema uri per model path", () => {
    const pathA = getFreeTextFilterModelPath("inst-1", 0, 0);
    const pathB = getFreeTextFilterModelPath("inst-2", 0, 0);
    const registrationA = getFreeTextFilterJsonSchemaRegistration({ type: "object" }, pathA);
    const registrationB = getFreeTextFilterJsonSchemaRegistration({ type: "object" }, pathB);

    expect(registrationA.uri).not.toBe(registrationB.uri);
    expect(registrationA.uri).toBe(`${pathA}.schema.json`);
  });

  it("reuses schema body reference in registration", () => {
    const modelPath = getFreeTextFilterModelPath("inst", 1, 2);
    const schemaBody = { type: "object" };
    const registration = getFreeTextFilterJsonSchemaRegistration(schemaBody, modelPath);

    expect(registration.uri).toBe(`${modelPath}.schema.json`);
    expect(registration.fileMatch).toEqual([modelPath]);
    expect(registration.schema).toBe(schemaBody);
  });
});
