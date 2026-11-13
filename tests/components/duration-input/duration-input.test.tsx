// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DurationInput,
  type DurationInputProps,
} from "../../../src/components/inputs/duration-input";
import ruCommon from "../../../src/locales/ru/common.json";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key
        .split(".")
        .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], ruCommon),
  }),
}));

type TestUnit = "seconds" | "minutes" | "hours";

const UNITS: TestUnit[] = ["seconds", "minutes", "hours"];

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

const renderInput = (overrides: Partial<DurationInputProps<TestUnit>> = {}) => {
  const onValueChange = vi.fn();
  const onUnitChange = vi.fn();

  render(
    <DurationInput<TestUnit>
      value={5}
      unit="minutes"
      units={UNITS}
      onValueChange={onValueChange}
      onUnitChange={onUnitChange}
      {...overrides}
    />
  );

  return { onValueChange, onUnitChange };
};

describe("DurationInput", () => {
  it("renders value and translated unit", () => {
    renderInput();

    expect(screen.getByRole("spinbutton")).toHaveProperty("value", "5");
    expect(screen.getByText("Минуты")).toBeTruthy();
  });

  it("offers only configured units", () => {
    renderInput({ units: ["seconds", "minutes"] });

    fireEvent.mouseDown(screen.getByRole("combobox"));

    expect(screen.getByTitle("Секунды")).toBeTruthy();
    expect(screen.queryByTitle("Часы")).toBeNull();
  });

  it("reports value changes and clearing", () => {
    const { onValueChange } = renderInput();
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.change(input, { target: { value: "" } });

    expect(onValueChange).toHaveBeenNthCalledWith(1, 12);
    expect(onValueChange).toHaveBeenNthCalledWith(2, null);
  });

  it("reports unit changes", () => {
    const { onUnitChange } = renderInput();

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(screen.getByTitle("Часы"));

    expect(onUnitChange).toHaveBeenCalledWith("hours", expect.anything());
  });

  it.each(["-", "+", ",", "e", "a", " ", "."])("blocks non-integer character %j", (key) => {
    renderInput();

    expect(fireEvent.keyDown(screen.getByRole("spinbutton"), { key })).toBe(false);
  });

  it.each([
    { key: "7" },
    { key: "Backspace" },
    { key: "Enter" },
    { key: "Escape" },
    { key: "z", ctrlKey: true },
    { key: "v", metaKey: true },
  ])("allows key %j", (init) => {
    renderInput();

    expect(fireEvent.keyDown(screen.getByRole("spinbutton"), init)).toBe(true);
  });

  it("allows decimal point in decimal mode", () => {
    renderInput({ precision: 2 });

    expect(fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "." })).toBe(true);
  });

  it.each([
    ["120", true],
    ["1.5", false],
    ["1.", false],
    ["-5", false],
    ["10 сек", false],
  ])("paste %j allowed: %s", (text, allowed) => {
    renderInput();

    const isNotPrevented = fireEvent.paste(screen.getByRole("spinbutton"), {
      clipboardData: { getData: () => text },
    });

    expect(isNotPrevented).toBe(allowed);
  });

  it.each([
    ["120", true],
    ["1.5", true],
    ["1.50", true],
    ["1.", true],
    ["1.501", false],
  ])("decimal paste %j allowed: %s", (text, allowed) => {
    renderInput({ precision: 2 });

    const isNotPrevented = fireEvent.paste(screen.getByRole("spinbutton"), {
      clipboardData: { getData: () => text },
    });

    expect(isNotPrevented).toBe(allowed);
  });

  it("keeps consumer key and paste handlers", () => {
    const onKeyDown = vi.fn();
    const onPaste = vi.fn();
    renderInput({ onKeyDown, onPaste });
    const input = screen.getByRole("spinbutton");

    fireEvent.keyDown(input, { key: "-" });
    fireEvent.paste(input, { clipboardData: { getData: () => "12" } });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onPaste).toHaveBeenCalledTimes(1);
  });

  it("disables both number and unit controls", () => {
    renderInput({ disabled: true });

    expect(screen.getByRole("spinbutton")).toHaveProperty("disabled", true);
    expect(screen.getByRole("combobox")).toHaveProperty("disabled", true);
  });
});
