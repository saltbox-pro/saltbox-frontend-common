// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTableSettings,
  updateTableSettings,
} from "../../../src/components/fast-table/model/table-settings";
import {
  ensureUserSettingsLoaded,
  initUserSettings,
  type UserSettingsTransport,
} from "../../../src/store/user-settings-store";

function createMemoryTransport(
  initial: Record<string, unknown> = {}
): UserSettingsTransport & { stored: Record<string, unknown> } {
  let stored = structuredClone(initial);

  return {
    get stored() {
      return stored;
    },
    load: async () => structuredClone(stored),
    save: async (settings) => {
      stored = structuredClone(settings);
      return structuredClone(settings);
    },
  };
}

describe("table-settings", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    initUserSettings(createMemoryTransport());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses valid sizing keys and skips invalid ones", async () => {
    initUserSettings(
      createMemoryTransport({
        tables: {
          jobs: {
            column_sizing: { id: 120, bad: -1, also: "x", ok: 80 },
            column_layout: { order: ["id", 1, "status"], hidden: ["status", null] },
          },
        },
      })
    );
    await ensureUserSettingsLoaded();

    expect(getTableSettings("jobs")).toEqual({
      columnSizing: { id: 120, ok: 80 },
      columnLayout: { order: ["id", "status"], hidden: ["status"] },
    });
  });

  it("updateTableSettings merges patch fields", () => {
    updateTableSettings("t1", { columnSizing: { id: 10 } });
    updateTableSettings("t1", { columnLayout: { order: ["id"], hidden: [] } });

    expect(getTableSettings("t1")).toEqual({
      columnSizing: { id: 10 },
      columnLayout: { order: ["id"], hidden: [] },
    });
  });
});
