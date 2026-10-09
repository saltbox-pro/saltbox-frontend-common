import type { ColumnSizingState } from "@tanstack/react-table";

import {
  getUserSettingsValue,
  setUserSettingsValue,
} from "saltbox-common/store/user-settings-store";

import { type ColumnLayout, isEmptyColumnLayout } from "../utils/column-layout";

const TABLES_SECTION = "tables";
const COLUMN_SIZING_KEY = "column_sizing";
const COLUMN_LAYOUT_KEY = "column_layout";

export type TableSettings = {
  columnSizing?: ColumnSizingState;
  columnLayout?: ColumnLayout;
};

export const EMPTY_TABLE_SETTINGS: TableSettings = {};

const parsedByRawValue = new WeakMap<object, TableSettings>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseColumnIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.every((item) => typeof item === "string") ? [...(value as string[])] : [];
}

function parseColumnLayout(value: unknown): ColumnLayout | undefined {
  if (!isRecord(value)) return undefined;

  const layout: ColumnLayout = {
    order: parseColumnIds(value.order),
    hidden: parseColumnIds(value.hidden),
  };

  return isEmptyColumnLayout(layout) ? undefined : layout;
}

function isPlausiblePixelSize(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 10_000;
}

function parseColumnSizing(value: unknown): ColumnSizingState | undefined {
  if (!isRecord(value)) return undefined;

  const sizing: ColumnSizingState = {};
  for (const [columnId, width] of Object.entries(value)) {
    if (!isPlausiblePixelSize(width)) return undefined;
    sizing[columnId] = width;
  }

  return Object.keys(sizing).length > 0 ? sizing : undefined;
}

function parseTableSettings(raw: Record<string, unknown>): TableSettings {
  const settings: TableSettings = {};

  const columnSizing = parseColumnSizing(raw[COLUMN_SIZING_KEY]);
  if (columnSizing) settings.columnSizing = columnSizing;

  const columnLayout = parseColumnLayout(raw[COLUMN_LAYOUT_KEY]);
  if (columnLayout) settings.columnLayout = columnLayout;

  return settings;
}

function serializeTableSettings(settings: TableSettings): Record<string, unknown> | undefined {
  const serialized: Record<string, unknown> = {};

  if (settings.columnSizing && Object.keys(settings.columnSizing).length > 0) {
    serialized[COLUMN_SIZING_KEY] = settings.columnSizing;
  }
  if (settings.columnLayout && !isEmptyColumnLayout(settings.columnLayout)) {
    serialized[COLUMN_LAYOUT_KEY] = settings.columnLayout;
  }

  return Object.keys(serialized).length > 0 ? serialized : undefined;
}

export function getTableSettings(tableId?: string): TableSettings {
  if (!tableId) return EMPTY_TABLE_SETTINGS;

  const raw = getUserSettingsValue([TABLES_SECTION, tableId]);
  if (!isRecord(raw)) return EMPTY_TABLE_SETTINGS;

  const cached = parsedByRawValue.get(raw);
  if (cached) return cached;

  const parsed = parseTableSettings(raw);
  parsedByRawValue.set(raw, parsed);

  return parsed;
}

export function updateTableSettings(tableId: string, patch: TableSettings): void {
  const next: TableSettings = { ...getTableSettings(tableId), ...patch };

  setUserSettingsValue([TABLES_SECTION, tableId], serializeTableSettings(next));
}
