import type { RuleObject } from "antd/es/form";

import { isInvalidJsonValueResult, parseAndValidateJsonValue } from "./validation";

export function createJsonValueValidator(
  t: (key: string, options?: Record<string, unknown>) => string
): NonNullable<RuleObject["validator"]> {
  return (_, raw) => {
    if (raw == null) return Promise.resolve();
    if (typeof raw === "string" && raw.trim() === "") return Promise.resolve();

    const result = parseAndValidateJsonValue(raw ?? "");

    if (isInvalidJsonValueResult(result)) {
      return Promise.reject(new Error(t(result.errorKey, result.errorOptions)));
    }

    return Promise.resolve();
  };
}
