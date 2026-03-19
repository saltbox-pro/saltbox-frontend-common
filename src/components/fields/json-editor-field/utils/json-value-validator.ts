import type { RuleObject } from "antd/es/form";

import { isParseValueError, parseAndValidateJsonValue } from "./validation";

export function createJsonValueValidator(
  t: (key: string, options?: Record<string, unknown>) => string
): NonNullable<RuleObject["validator"]> {
  return (_, raw) => {
    if (!raw?.trim()) return Promise.resolve();

    const result = parseAndValidateJsonValue(raw ?? "");

    if (isParseValueError(result)) {
      return Promise.reject(new Error(t(result.errorKey, { ns: "common" })));
    }

    return Promise.resolve();
  };
}
