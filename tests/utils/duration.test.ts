import { describe, expect, it } from "vitest";

import ruCommon from "../../src/locales/ru/common.json";
import {
  convertDurationUnitToSeconds,
  formatDuration,
  formatDurationParts,
  type DurationTranslateFn,
} from "../../src/utils/duration";

const t: DurationTranslateFn = (key) => {
  const [group, unit] = key.split(".");
  return (ruCommon as Record<string, Record<string, string>>)[group][unit];
};

describe("formatDuration", () => {
  it.each([
    [0, "0 сек"],
    [0.25, "250 мс"],
    [3, "3 сек"],
    [12.345, "12.35 сек"],
    [59.999, "1 мин"],
    [90, "1 мин 30 сек"],
    [120, "2 мин"],
    [3600, "1 ч"],
    [5400, "1 ч 30 мин"],
    [86400, "1 дн"],
    [90061, "1 дн 1 ч 1 мин 1 сек"],
    [604800, "7 дн"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatDuration(seconds, t)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, undefined as unknown as number, -5])(
    "returns empty string for invalid %s",
    (seconds) => {
      expect(formatDuration(seconds, t)).toBe("");
    }
  );
});

describe("convertDurationUnitToSeconds", () => {
  it.each([
    [5, "seconds", 5],
    [3, "minutes", 180],
    [2, "hours", 7200],
    [1, "days", 86400],
    [1.5, "minutes", 90],
    [0.03, "hours", 108],
    [1.01, "minutes", 61],
    [250, "milliseconds", 0.25],
    [500, "milliseconds", 0.5],
  ] as const)("converts %s %s to %s seconds", (value, unit, expected) => {
    expect(convertDurationUnitToSeconds(value, unit)).toBe(expected);
  });
});

describe("formatDurationParts", () => {
  it.each([
    [1.01, "minutes", "1.01 мин (1 мин 1 сек)"],
    [1.5, "minutes", "1.5 мин (1 мин 30 сек)"],
    [3, "minutes", "3 мин"],
    [65, "seconds", "65 сек (1 мин 5 сек)"],
    [0, "hours", "0 ч"],
  ] as const)("formats stored %s %s as %s", (value, unit, expected) => {
    expect(formatDurationParts(value, unit, t)).toBe(expected);
  });

  it.each([Number.NaN, -1] as const)("returns empty string for invalid %s", (value) => {
    expect(formatDurationParts(value, "minutes", t)).toBe("");
  });
});
