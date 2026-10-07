import type { MaterialSymbol } from "@material-symbols/font-300";

import {
  MATERIAL_ICON_METADATA_CATEGORIES,
  type MaterialIconMetadataCategory,
} from "./material-icon-metadata-categories";
import { isMaterialIconName } from "./material-icon-name";

export type MaterialIconGroup = {
  category: MaterialIconMetadataCategory | null;
  icons: readonly MaterialSymbol[];
};

type MaterialIconIndexEntry = {
  name: string;
  categories?: string[];
};

type MaterialIconIndex = Record<string, MaterialIconIndexEntry>;

let groupsPromise: Promise<readonly MaterialIconGroup[]> | null = null;

function getPrimaryCategory(categories: readonly string[]): MaterialIconMetadataCategory | null {
  return (
    MATERIAL_ICON_METADATA_CATEGORIES.find((category) => categories.includes(category)) ?? null
  );
}

function toMaterialIconGroups(iconIndex: MaterialIconIndex): MaterialIconGroup[] {
  const grouped = new Map<MaterialIconMetadataCategory, Set<MaterialSymbol>>();

  for (const category of MATERIAL_ICON_METADATA_CATEGORIES) {
    grouped.set(category, new Set());
  }

  for (const entry of Object.values(iconIndex)) {
    const name = entry.name;
    if (!isMaterialIconName(name)) {
      continue;
    }

    const category = getPrimaryCategory(entry.categories ?? []);
    if (!category) {
      continue;
    }

    grouped.get(category)?.add(name as MaterialSymbol);
  }

  return MATERIAL_ICON_METADATA_CATEGORIES.map((category) => ({
    category,
    icons: [...(grouped.get(category) ?? [])].sort(),
  })).filter((group) => group.icons.length > 0);
}

export function loadMaterialIconGroups(): Promise<readonly MaterialIconGroup[]> {
  groupsPromise ??=
    // vite-plugin-dts uses a TS module mode without dynamic import support
    // @ts-expect-error TS1323 dynamic import of metadata icon index
    import("@material-symbols-svg/metadata/icon-index.json")
      .then((metadataModule: { default?: MaterialIconIndex } | MaterialIconIndex) => {
        const iconIndex = (
          "default" in metadataModule && metadataModule.default
            ? metadataModule.default
            : metadataModule
        ) as MaterialIconIndex;
        return Object.freeze(toMaterialIconGroups(iconIndex));
      })
      .catch((error: unknown) => {
        groupsPromise = null;
        throw error;
      });

  return groupsPromise;
}

export function toCustomIconGroup(icons: readonly MaterialSymbol[]): MaterialIconGroup[] {
  if (icons.length === 0) {
    return [];
  }

  return [{ category: null, icons }];
}

export function getMaterialIconsSignature(
  icons: readonly MaterialSymbol[] | undefined
): string | null {
  if (icons === undefined) {
    return null;
  }

  return icons.join("\0");
}
