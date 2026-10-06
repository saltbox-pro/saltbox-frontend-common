import type { MaterialSymbol } from "@material-symbols/font-300";

import type { MaterialIconGroup } from "./load-material-icon-groups";

export const MATERIAL_ICON_PICKER_COLUMNS = 8;
export const MATERIAL_ICON_PICKER_GAP_PX = 4;
export const MATERIAL_ICON_PICKER_ROW_HEIGHT = 36;
export const MATERIAL_ICON_PICKER_HEADER_ROW_HEIGHT = 28;

type HeaderRow = {
  type: "header";
  key: string;
  category: string;
};

type IconsRow = {
  type: "icons";
  key: string;
  icons: readonly MaterialSymbol[];
};

type MaterialIconPickerVirtualRow = HeaderRow | IconsRow;

export function buildMaterialIconPickerIndex(
  groups: readonly MaterialIconGroup[]
): readonly MaterialIconPickerVirtualRow[] {
  const rows: MaterialIconPickerVirtualRow[] = [];

  for (const group of groups) {
    if (group.category) {
      rows.push({
        type: "header",
        key: `header:${group.category}`,
        category: group.category,
      });
    }

    for (let index = 0; index < group.icons.length; index += MATERIAL_ICON_PICKER_COLUMNS) {
      rows.push({
        type: "icons",
        key: `icons:${group.category ?? "custom"}:${index}`,
        icons: group.icons.slice(index, index + MATERIAL_ICON_PICKER_COLUMNS),
      });
    }
  }

  return rows;
}
