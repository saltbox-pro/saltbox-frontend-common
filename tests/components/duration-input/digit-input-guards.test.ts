import { describe, expect, it } from "vitest";

import {
  isDurationPasteAllowed,
  isForbiddenDurationInputKey,
} from "../../../src/components/inputs/duration-input/helpers/digit-input-guards";

describe("isForbiddenDurationInputKey", () => {
  it("blocks non-numeric characters", () => {
    expect(
      isForbiddenDurationInputKey({ key: "-", ctrlKey: false, metaKey: false, altKey: false })
    ).toBe(true);
  });

  it("blocks decimal point by default", () => {
    expect(
      isForbiddenDurationInputKey(
        { key: ".", ctrlKey: false, metaKey: false, altKey: false },
        { value: "12", selectionStart: 2, selectionEnd: 2 }
      )
    ).toBe(true);
  });

  it("allows digits and the first decimal point in decimal mode", () => {
    expect(
      isForbiddenDurationInputKey(
        { key: ".", ctrlKey: false, metaKey: false, altKey: false },
        { value: "12", selectionStart: 2, selectionEnd: 2 },
        2
      )
    ).toBe(false);
  });

  it("blocks a second decimal point in decimal mode", () => {
    expect(
      isForbiddenDurationInputKey(
        { key: ".", ctrlKey: false, metaKey: false, altKey: false },
        { value: "1.5", selectionStart: 3, selectionEnd: 3 },
        2
      )
    ).toBe(true);
  });

  it("blocks a third fractional digit in decimal mode", () => {
    expect(
      isForbiddenDurationInputKey(
        { key: "2", ctrlKey: false, metaKey: false, altKey: false },
        { value: "1.01", selectionStart: 4, selectionEnd: 4 },
        2
      )
    ).toBe(true);
  });

  it("allows replacing a selected fractional part in decimal mode", () => {
    expect(
      isForbiddenDurationInputKey(
        { key: "2", ctrlKey: false, metaKey: false, altKey: false },
        { value: "1.01", selectionStart: 2, selectionEnd: 4 },
        2
      )
    ).toBe(false);
  });
});

describe("isDurationPasteAllowed", () => {
  it.each([
    ["120", true],
    ["1.5", false],
    ["1.", false],
    ["1.50", false],
  ])("integer paste %j allowed: %s", (text, allowed) => {
    expect(isDurationPasteAllowed(text)).toBe(allowed);
  });

  it.each([
    ["120", true],
    ["1.5", true],
    ["1.50", true],
    ["1.", true],
    ["1.501", false],
    ["1.2.3", false],
  ])("decimal paste %j allowed: %s", (text, allowed) => {
    expect(isDurationPasteAllowed(text, 2)).toBe(allowed);
  });

  it("validates paste against the resulting input value", () => {
    expect(
      isDurationPasteAllowed("5", 0, { value: "12", selectionStart: 2, selectionEnd: 2 })
    ).toBe(true);
    expect(
      isDurationPasteAllowed("1.5", 2, { value: "1.5", selectionStart: 3, selectionEnd: 3 })
    ).toBe(false);
  });
});
