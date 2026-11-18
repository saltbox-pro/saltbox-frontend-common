import {
  getUserSettingsValue,
  setUserSettingsValue,
} from "saltbox-common/store/user-settings-store";

const DRAWERS_SECTION = "drawers";
const WIDTH_KEY = "width";

const getWidthPath = (drawerId: string): string[] => [DRAWERS_SECTION, drawerId, WIDTH_KEY];

const isPlausiblePixelWidth = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 10_000;

export function getDrawerMaxWidthPx(): number {
  if (typeof window === "undefined") return Number.POSITIVE_INFINITY;
  return window.innerWidth;
}

const clampToViewport = (widthPx: number): number => Math.min(widthPx, getDrawerMaxWidthPx());

export function getDrawerWidthPx(drawerId: string): number | undefined {
  const value = getUserSettingsValue(getWidthPath(drawerId));
  if (!isPlausiblePixelWidth(value)) return undefined;

  return clampToViewport(value);
}

export function setDrawerWidthPx(drawerId: string, widthPx: number): void {
  const clamped = clampToViewport(widthPx);
  if (!isPlausiblePixelWidth(clamped)) return;

  setUserSettingsValue(getWidthPath(drawerId), Math.round(clamped));
}
