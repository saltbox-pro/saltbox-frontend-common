import {
  getUserSettingsValue,
  revertUserSettingsValue,
  setUserSettingsValue,
} from "saltbox-common/store/user-settings-store";

const SIDEBAR_KEY = "sidebar";
const LAYOUT_KEY = "layout";

export type SidebarLayout = {
  groupOrder: string[];
  itemOrder: Record<string, string[]>;
  hiddenItems: string[];
  shownItems: string[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  return Object.values(value).every(isStringArray);
}

export function isSidebarLayout(value: unknown): value is SidebarLayout {
  if (typeof value !== "object" || value === null) return false;

  const layout = value as Partial<SidebarLayout>;

  return (
    isStringArray(layout.groupOrder) &&
    isStringArrayRecord(layout.itemOrder) &&
    isStringArray(layout.hiddenItems) &&
    isStringArray(layout.shownItems)
  );
}

export function getSidebarLayout(): SidebarLayout | undefined {
  const layout = getUserSettingsValue([SIDEBAR_KEY, LAYOUT_KEY]);

  return isSidebarLayout(layout) ? layout : undefined;
}

export function setSidebarLayout(layout: SidebarLayout | undefined): void {
  setUserSettingsValue([SIDEBAR_KEY, LAYOUT_KEY], layout);
}

export function revertSidebarLayout(layout: SidebarLayout | undefined): void {
  revertUserSettingsValue([SIDEBAR_KEY, LAYOUT_KEY], layout);
}
