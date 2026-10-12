// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UiEvent } from "../../src/interfaces/ui-events";
import {
  createUserSettingsTransport,
  ensureUserSettingsLoaded,
  getUserSettingsValue,
  initUserSettings,
  setUserSettingsValue,
  subscribeUserSettings,
  type UserSettingsTransport,
} from "../../src/store/user-settings-store";

function createMemoryTransport(
  initial: Record<string, unknown> = {}
): UserSettingsTransport & { stored: Record<string, unknown>; saves: number; loads: number } {
  const state = {
    stored: structuredClone(initial),
    saves: 0,
    loads: 0,
  };

  return {
    get stored() {
      return state.stored;
    },
    set stored(value: Record<string, unknown>) {
      state.stored = value;
    },
    get saves() {
      return state.saves;
    },
    get loads() {
      return state.loads;
    },
    load: async () => {
      state.loads += 1;
      return structuredClone(state.stored);
    },
    save: async (settings) => {
      state.saves += 1;
      state.stored = structuredClone(settings);
      return structuredClone(settings);
    },
  };
}

describe("user-settings-store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    initUserSettings(createMemoryTransport());
  });

  it("loads settings and notifies subscribers", async () => {
    const transport = createMemoryTransport({
      tables: { "core-jobs": { column_sizing: { id: 120 } } },
    });
    const listener = vi.fn();

    initUserSettings(transport);
    const unsubscribe = subscribeUserSettings(listener);
    await ensureUserSettingsLoaded();

    expect(getUserSettingsValue(["tables", "core-jobs"])).toEqual({
      column_sizing: { id: 120 },
    });
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("debounces save and merges dirty paths over fresh load", async () => {
    const transport = createMemoryTransport({ other: { keep: true } });
    initUserSettings(transport);

    setUserSettingsValue(["tables", "core-jobs"], { column_sizing: { id: 200 } });
    setUserSettingsValue(["tables", "core-jobs"], {
      column_sizing: { id: 200 },
      column_layout: { order: ["id"], hidden: [] },
    });

    expect(transport.saves).toBe(0);
    await vi.advanceTimersByTimeAsync(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(transport.saves).toBe(1);
    expect(transport.stored).toEqual({
      other: { keep: true },
      tables: {
        "core-jobs": {
          column_sizing: { id: 200 },
          column_layout: { order: ["id"], hidden: [] },
        },
      },
    });
  });

  it("restores dirty paths and retries save with backoff after failure", async () => {
    const transport = createMemoryTransport();
    let shouldFail = true;
    const originalSave = transport.save.bind(transport);
    transport.save = async (settings) => {
      if (shouldFail) {
        shouldFail = false;
        throw new Error("network");
      }
      return originalSave(settings);
    };

    initUserSettings(transport);
    setUserSettingsValue(["tables", "a"], { column_sizing: { id: 1 } });

    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    await Promise.resolve();

    expect(transport.saves).toBe(0);
    expect(getUserSettingsValue(["tables", "a"])).toEqual({ column_sizing: { id: 1 } });

    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    await Promise.resolve();

    expect(transport.saves).toBe(1);
    expect(transport.stored).toEqual({
      tables: { a: { column_sizing: { id: 1 } } },
    });
  });

  it("does not auto-retry non-retryable 4xx errors", async () => {
    const transport = createMemoryTransport();
    const error = Object.assign(new Error("forbidden"), { status: 403 });
    transport.save = async () => {
      throw error;
    };
    const saveSpy = vi.spyOn(transport, "save");

    initUserSettings(transport);
    setUserSettingsValue(["tables", "a"], { column_sizing: { id: 1 } });

    await vi.advanceTimersByTimeAsync(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(saveSpy).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(10_000);
    await Promise.resolve();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(getUserSettingsValue(["tables", "a"])).toEqual({ column_sizing: { id: 1 } });
  });

  it("adopts foreign settings via UiEvent and keeps local dirty paths", async () => {
    const transport = createMemoryTransport({ tables: { remote: { column_sizing: { a: 1 } } } });
    initUserSettings(transport);
    await ensureUserSettingsLoaded();

    setUserSettingsValue(["tables", "local"], { column_sizing: { b: 2 } });

    document.dispatchEvent(
      new CustomEvent(UiEvent.UserSettingsChanged, {
        detail: {
          settings: {
            tables: {
              remote: { column_sizing: { a: 10 } },
              other: { column_sizing: { c: 3 } },
            },
          },
        },
      })
    );

    expect(getUserSettingsValue(["tables", "remote"])).toEqual({ column_sizing: { a: 10 } });
    expect(getUserSettingsValue(["tables", "other"])).toEqual({ column_sizing: { c: 3 } });
    expect(getUserSettingsValue(["tables", "local"])).toEqual({ column_sizing: { b: 2 } });
  });

  it("createUserSettingsTransport requires api", async () => {
    const transport = createUserSettingsTransport(() => undefined);
    await expect(transport.load()).rejects.toThrow("User settings API is not available");
  });

  it("rejects ensureUserSettingsLoaded when transport load fails", async () => {
    const transport = createMemoryTransport();
    transport.load = async () => {
      throw new Error("offline");
    };
    initUserSettings(transport);

    await expect(ensureUserSettingsLoaded()).rejects.toThrow("offline");
  });
});
