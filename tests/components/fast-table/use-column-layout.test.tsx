// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useColumnLayout } from "../../../src/components/fast-table/hooks/use-column-layout";
import { getTableSettings } from "../../../src/components/fast-table/model/table-settings";
import {
  ensureUserSettingsLoaded,
  initUserSettings,
  resetUserSettingsStore,
} from "../../../src/store/user-settings-store";

const columns: ColumnDef<{ id: string; method: string; status: string }>[] = [
  { accessorKey: "id", enableHiding: false },
  { accessorKey: "method" },
  { accessorKey: "status" },
];
const defaultHiddenColumnIds = ["method"];

describe("useColumnLayout defaults", () => {
  beforeEach(() => {
    resetUserSettingsStore();
  });

  afterEach(() => {
    cleanup();
    resetUserSettingsStore();
  });

  it("uses defaults without saving them and ignores unknown or fixed columns", () => {
    const { result } = renderHook(() =>
      useColumnLayout({
        tableId: "jobs",
        columns,
        defaultHiddenColumnIds: ["id", "method", "removed"],
      })
    );

    expect(result.current.columnOrder).toEqual(["id", "method", "status"]);
    expect(result.current.columnVisibility).toEqual({ method: false });
    expect(getTableSettings("jobs")).toEqual({});
  });

  it("keeps existing tables visible when no defaults are provided", () => {
    const { result } = renderHook(() => useColumnLayout({ tableId: "jobs", columns }));

    expect(result.current.columnVisibility).toEqual({});
  });

  it("restores saved layout after asynchronous settings loading", async () => {
    let resolveLoad!: (settings: Record<string, unknown>) => void;
    const load = new Promise<Record<string, unknown>>((resolve) => {
      resolveLoad = resolve;
    });
    initUserSettings({
      isAvailable: () => true,
      load: () => load,
      save: vi.fn(async (settings) => settings),
    });

    const { result } = renderHook(() =>
      useColumnLayout({ tableId: "jobs", columns, defaultHiddenColumnIds })
    );
    expect(result.current.columnVisibility).toEqual({ method: false });

    await act(async () => {
      resolveLoad({
        tables: {
          jobs: {
            column_layout: { order: ["status", "method", "removed"], hidden: ["removed"] },
          },
        },
      });
      await ensureUserSettingsLoaded();
    });

    expect(result.current.columnOrder).toEqual(["id", "status", "method"]);
    expect(result.current.columnVisibility).toEqual({});
  });

  it("retains an explicitly enabled default-hidden column on remount", () => {
    const { result, unmount } = renderHook(() =>
      useColumnLayout({ tableId: "jobs", columns, defaultHiddenColumnIds })
    );

    act(() => {
      result.current.applyColumnLayout({ order: ["id", "status", "method"], hidden: [] });
    });
    unmount();

    const restored = renderHook(() =>
      useColumnLayout({ tableId: "jobs", columns, defaultHiddenColumnIds })
    );
    expect(restored.result.current.columnVisibility).toEqual({});
    expect(restored.result.current.columnOrder).toEqual(["id", "status", "method"]);
  });

  it("uses defaults for a different table without carrying over the previous layout", () => {
    const { result, rerender } = renderHook(
      ({ tableId }) => useColumnLayout({ tableId, columns, defaultHiddenColumnIds }),
      { initialProps: { tableId: "jobs" } }
    );
    act(() => {
      result.current.applyColumnLayout({ order: ["id", "method", "status"], hidden: ["status"] });
    });

    rerender({ tableId: "master-jobs" });
    expect(result.current.columnVisibility).toEqual({ method: false });

    rerender({ tableId: "jobs" });
    expect(result.current.columnVisibility).toEqual({ status: false });
  });

  it("updates defaults when no user layout exists", () => {
    const { result, rerender } = renderHook(
      ({ hidden }) => useColumnLayout({ tableId: "jobs", columns, defaultHiddenColumnIds: hidden }),
      { initialProps: { hidden: ["method"] } }
    );

    rerender({ hidden: ["status"] });
    expect(result.current.columnVisibility).toEqual({ status: false });
  });
});
