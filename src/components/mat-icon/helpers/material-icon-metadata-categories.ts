export const MATERIAL_ICON_METADATA_CATEGORIES = [
  "hardware",
  "device",
  "home",
  "places",
  "maps",
  "navigation",
  "communication",
  "notification",
  "alert",
  "file",
  "content",
  "editor",
  "image",
  "av",
  "search",
  "action",
  "toggle",
  "social",
  "symbols",
] as const;

export type MaterialIconMetadataCategory = (typeof MATERIAL_ICON_METADATA_CATEGORIES)[number];
