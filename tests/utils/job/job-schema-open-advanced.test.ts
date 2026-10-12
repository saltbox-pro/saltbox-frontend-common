import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  getJobParamsSchemaLayout,
  validateJobJsonFormData,
  type JsonSchemaRecord,
} from "../../../src/utils/job/job-schema-split";

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), "../../fixtures");

const loadSchema = (relativePath: string): JsonSchemaRecord =>
  JSON.parse(readFileSync(join(fixturesRoot, relativePath), "utf8")) as JsonSchemaRecord;

const HARDWARE_ID_PATTERN = "^[A-Za-z0-9\\\\&_\\\\-]{1,200}$";

const policySchema = {
  type: "object",
  required: ["apply"],
  properties: {
    apply: {
      oneOf: [
        {
          type: "object",
          properties: {
            mode: { type: "string", const: "deny" },
            allowed_ids: {
              type: "array",
              items: { type: "string", pattern: HARDWARE_ID_PATTERN },
            },
          },
          required: ["mode"],
        },
        {
          type: "object",
          properties: {
            mode: { type: "string", const: "allow" },
            methods: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
            },
          },
          required: ["mode", "methods"],
        },
      ],
    },
    advanced_only: {
      type: "string",
      minLength: 1,
    },
  },
} as JsonSchemaRecord;

const rdpIfThenSchema = {
  type: "object",
  additionalProperties: false,
  required: ["kwargs"],
  properties: {
    kwargs: {
      type: "object",
      additionalProperties: false,
      required: ["pillar"],
      properties: {
        pillar: {
          type: "object",
          required: ["rdp_state"],
          additionalProperties: false,
          properties: {
            rdp_state: { type: "boolean" },
            security_layer: { type: "integer", enum: [0, 1, 2] },
          },
          if: {
            properties: { rdp_state: { const: true } },
            required: ["rdp_state"],
          },
          then: {
            required: ["security_layer"],
          },
        },
      },
    },
    advanced_only: {
      type: "string",
      minLength: 1,
    },
  },
} as JsonSchemaRecord;

const propertyDependencySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1 },
    advanced_only: { type: "string", minLength: 1 },
  },
  dependencies: {
    advanced_only: ["name"],
  },
} as JsonSchemaRecord;

const validateBasicLayout = (schema: JsonSchemaRecord, formData: Record<string, unknown>) => {
  const layout = getJobParamsSchemaLayout(schema, undefined, false);
  return validateJobJsonFormData(
    formData,
    schema,
    undefined,
    false,
    layout.displaySchema,
    layout.displayUiSchema
  );
};

const validateAdvancedLayout = (schema: JsonSchemaRecord, formData: Record<string, unknown>) => {
  const layout = getJobParamsSchemaLayout(schema, undefined, true);
  return validateJobJsonFormData(
    formData,
    schema,
    undefined,
    true,
    layout.displaySchema,
    layout.displayUiSchema
  );
};

describe("validateJobJsonFormData openAdvanced", () => {
  it("does not treat visible oneOf field errors as hidden advanced-only errors", () => {
    const result = validateBasicLayout(policySchema, {
      apply: {
        mode: "deny",
        allowed_ids: ["USB\\VID_13 FE&PID_4100", "USBSTOR\\Disk____USB_DISK_2.0___PMAP"],
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("opens advanced when an optional field outside the basic layout is invalid", () => {
    const result = validateBasicLayout(policySchema, {
      apply: {
        mode: "deny",
        allowed_ids: ["USB\\VID_13FE&PID_4100"],
      },
      advanced_only: "",
    });

    expect(result).toEqual({ ok: false, openAdvanced: true });
  });

  it("does not open advanced when security_layer is missing for enabled rdp", () => {
    const result = validateBasicLayout(rdpIfThenSchema, {
      kwargs: { pillar: { rdp_state: true } },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("accepts disabled rdp without security_layer", () => {
    expect(
      validateBasicLayout(rdpIfThenSchema, {
        kwargs: { pillar: { rdp_state: false } },
      })
    ).toEqual({ ok: true });
  });

  it("opens advanced for invalid optional field with if/then schema", () => {
    expect(
      validateBasicLayout(rdpIfThenSchema, {
        kwargs: { pillar: { rdp_state: false } },
        advanced_only: "",
      })
    ).toEqual({ ok: false, openAdvanced: true });
  });

  it("ignores property-dependency arrays when deciding openAdvanced for required fields", () => {
    const result = validateBasicLayout(propertyDependencySchema, { name: "" });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("opens advanced for invalid optional default in environ.get fun schema", () => {
    const result = validateBasicLayout(loadSchema("salt-func-schemas/environ-get.schema.json"), {
      kwargs: { key: "PATH", default: 123 },
    });

    expect(result).toEqual({ ok: false, openAdvanced: true });
  });

  it("opens advanced for invalid optional sanitize in grains.item fun schema", () => {
    const result = validateBasicLayout(loadSchema("salt-func-schemas/grains-item.schema.json"), {
      args: ["os"],
      sanitize: "nope",
    });

    expect(result).toEqual({ ok: false, openAdvanced: true });
  });

  it("accepts grains.item with only required args", () => {
    expect(
      validateBasicLayout(loadSchema("salt-func-schemas/grains-item.schema.json"), {
        args: ["os"],
      })
    ).toEqual({ ok: true });
  });

  it("returns ok when advanced is open and full schema validates", () => {
    expect(
      validateAdvancedLayout(loadSchema("salt-func-schemas/grains-item.schema.json"), {
        args: ["os"],
      })
    ).toEqual({ ok: true });
  });

  it("asks for form ref validation when advanced is open and data is invalid", () => {
    expect(
      validateAdvancedLayout(loadSchema("salt-func-schemas/grains-item.schema.json"), {
        args: ["os"],
        sanitize: "nope",
      })
    ).toEqual({ ok: false, useFormRef: true });
  });

  it("validates display schema when advanced is open without a full json schema", () => {
    const displaySchema = {
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" } },
    } as JsonSchemaRecord;

    expect(
      validateJobJsonFormData({ name: "ok" }, undefined, undefined, true, displaySchema, undefined)
    ).toEqual({ ok: true });

    expect(
      validateJobJsonFormData({}, undefined, undefined, true, displaySchema, undefined)
    ).toEqual({ ok: false, useFormRef: true });
  });

  it("does not open advanced for invalid allow_hardware_ids with a space", () => {
    const result = validateBasicLayout(loadSchema("base-windows/usb-init.schema.json"), {
      kwargs: {
        pillar: {
          enabled: true,
          mode: "block",
          methods: ["deny_disk_class", "device_install"],
          allow_hardware_ids: ["USB\\VID_13 FE&PID_4100", "USBSTOR\\Disk____USB_DISK_2.0___PMAP"],
        },
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("accepts valid USB storage policy form data", () => {
    expect(
      validateBasicLayout(loadSchema("base-windows/usb-init.schema.json"), {
        kwargs: {
          pillar: {
            enabled: true,
            mode: "block",
            methods: ["deny_disk_class", "device_install"],
            allow_hardware_ids: ["USB\\VID_13FE&PID_4100", "USBSTOR\\Disk____USB_DISK_2.0___PMAP"],
          },
        },
      })
    ).toEqual({ ok: true });
  });

  it("does not open advanced for an invalid service name in properties", () => {
    const result = validateBasicLayout(loadSchema("base-windows/services-init.schema.json"), {
      kwargs: {
        pillar: {
          action: "manage",
          name: "bad@name",
          state: "start",
        },
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("does not open advanced when create action misses bin_path from dependencies", () => {
    const result = validateBasicLayout(loadSchema("base-windows/services-init.schema.json"), {
      kwargs: {
        pillar: {
          action: "create",
          name: "MySvc",
          state: "stop",
          start_type: "manual",
        },
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("does not open advanced for invalid dependency service names", () => {
    const result = validateBasicLayout(loadSchema("base-windows/services-init.schema.json"), {
      kwargs: {
        pillar: {
          action: "modify",
          name: "MySvc",
          state: "start",
          start_type: "manual",
          dependencies: ["RpcSs", "bad@dep"],
        },
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("does not open advanced when custom account misses credentials", () => {
    const result = validateBasicLayout(loadSchema("base-windows/services-init.schema.json"), {
      kwargs: {
        pillar: {
          action: "modify",
          name: "MySvc",
          state: "start",
          start_type: "manual",
          account_type: "custom",
        },
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });

  it("does not open advanced for invalid registry entry fields from dependencies", () => {
    const result = validateBasicLayout(loadSchema("base-windows/registry-init.schema.json"), {
      kwargs: {
        pillar: {
          action: "present",
          entries: [
            {
              key: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System",
              vname: " EnableSmartScreen",
              vtype: "REG_SZ",
              vdata: "1",
            },
          ],
        },
      },
    });

    expect(result).not.toEqual(expect.objectContaining({ openAdvanced: true }));
    expect(result.ok).toBe(false);
  });
});
