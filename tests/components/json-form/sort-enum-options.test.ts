import { describe, expect, it } from "vitest";

import { sortEnumOptionsByLabel } from "../../../src/components/json-form/helpers/sort-enum-options";
import { AppLanguage } from "../../../src/interfaces/locales";

describe("sortEnumOptionsByLabel", () => {
  it("returns undefined and short lists unchanged", () => {
    expect(sortEnumOptionsByLabel(undefined, AppLanguage.EN)).toBeUndefined();
    expect(sortEnumOptionsByLabel([], AppLanguage.EN)).toEqual([]);

    const single = [{ value: "a", label: "Alpha" }];
    expect(sortEnumOptionsByLabel(single, AppLanguage.EN)).toBe(single);
  });

  it("does not mutate the original array", () => {
    const options = [
      { value: "b", label: "Bravo" },
      { value: "a", label: "Alpha" },
    ];
    const originalOrder = options.map((option) => option.value);

    sortEnumOptionsByLabel(options, AppLanguage.EN);

    expect(options.map((option) => option.value)).toEqual(originalOrder);
  });

  it("sorts by English labels ascending and keeps value-label pairs", () => {
    const sorted = sortEnumOptionsByLabel(
      [
        { value: "stop", label: "Stop" },
        { value: "restart", label: "Restart" },
        { value: "start", label: "Start" },
      ],
      AppLanguage.EN
    );

    expect(sorted?.map((option) => option.value)).toEqual(["restart", "start", "stop"]);
    expect(sorted?.map((option) => option.label)).toEqual(["Restart", "Start", "Stop"]);
  });

  it("reorders by localized Russian labels", () => {
    const options = [
      { value: "network", label: "Сеть" },
      { value: "firewall", label: "Брандмауэр" },
      { value: "apps", label: "Приложения" },
    ];

    const sortedRu = sortEnumOptionsByLabel(options, AppLanguage.RU);
    expect(sortedRu?.map((option) => option.value)).toEqual(["firewall", "apps", "network"]);

    const sortedEn = sortEnumOptionsByLabel(
      [
        { value: "network", label: "Network" },
        { value: "firewall", label: "Firewall" },
        { value: "apps", label: "Applications" },
      ],
      AppLanguage.EN
    );
    expect(sortedEn?.map((option) => option.value)).toEqual(["apps", "firewall", "network"]);
  });

  it("is case-insensitive", () => {
    const sorted = sortEnumOptionsByLabel(
      [
        { value: "windows", label: "windows" },
        { value: "Linux", label: "Linux" },
        { value: "macos", label: "macOS" },
      ],
      AppLanguage.EN
    );

    expect(sorted?.map((option) => option.value)).toEqual(["Linux", "macos", "windows"]);
  });

  it("handles diacritics and special characters with base sensitivity", () => {
    const sorted = sortEnumOptionsByLabel(
      [
        { value: "cafe", label: "Cafe" },
        { value: "cafe-acute", label: "Café" },
        { value: "cable", label: "Cable" },
      ],
      AppLanguage.EN
    );

    expect(sorted?.map((option) => option.value)).toEqual(["cable", "cafe", "cafe-acute"]);
  });

  it("accepts locale with region suffix", () => {
    const sorted = sortEnumOptionsByLabel(
      [
        { value: "b", label: "Береза" },
        { value: "a", label: "Аист" },
      ],
      "ru-RU"
    );

    expect(sorted?.map((option) => option.value)).toEqual(["a", "b"]);
  });
});
