import { afterEach, describe, expect, it, vi } from "vitest";

import { revalidateJsonFormAfterAdvancedOpen } from "../../../src/components/json-form/utils/revalidate-json-form-after-advanced-open";

describe("revalidateJsonFormAfterAdvancedOpen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("validates immediately when form is available", () => {
    const validateForm = vi.fn(() => false);
    const shouldRevalidateRef = { current: true };
    const onMissingForm = vi.fn();

    revalidateJsonFormAfterAdvancedOpen({
      shouldRevalidateRef,
      isAdvanced: true,
      formRef: { current: { validateForm } },
      onMissingForm,
    });

    expect(validateForm).toHaveBeenCalledTimes(1);
    expect(shouldRevalidateRef.current).toBe(false);
    expect(onMissingForm).not.toHaveBeenCalled();
  });

  it("retries after microtask when form appears later", async () => {
    const validateForm = vi.fn(() => false);
    const shouldRevalidateRef = { current: true };
    const formRef: { current: { validateForm: () => boolean } | null } = { current: null };
    const onMissingForm = vi.fn();

    revalidateJsonFormAfterAdvancedOpen({
      shouldRevalidateRef,
      isAdvanced: true,
      formRef,
      onMissingForm,
    });

    expect(validateForm).not.toHaveBeenCalled();
    expect(shouldRevalidateRef.current).toBe(true);

    formRef.current = { validateForm };
    await Promise.resolve();

    expect(validateForm).toHaveBeenCalledTimes(1);
    expect(shouldRevalidateRef.current).toBe(false);
    expect(onMissingForm).not.toHaveBeenCalled();
  });

  it("calls onMissingForm after retries if form never appears", async () => {
    vi.useFakeTimers();
    const shouldRevalidateRef = { current: true };
    const onMissingForm = vi.fn();

    revalidateJsonFormAfterAdvancedOpen({
      shouldRevalidateRef,
      isAdvanced: true,
      formRef: { current: null },
      onMissingForm,
    });

    await Promise.resolve();
    await vi.runAllTimersAsync();

    expect(onMissingForm).toHaveBeenCalledTimes(1);
    expect(shouldRevalidateRef.current).toBe(false);
  });

  it("keeps the flag when form is missing and onMissingForm is not provided", async () => {
    vi.useFakeTimers();
    const shouldRevalidateRef = { current: true };

    revalidateJsonFormAfterAdvancedOpen({
      shouldRevalidateRef,
      isAdvanced: true,
      formRef: { current: null },
    });

    await Promise.resolve();
    await vi.runAllTimersAsync();

    expect(shouldRevalidateRef.current).toBe(true);
  });
});
