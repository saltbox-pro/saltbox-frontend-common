import type { MaterialIconGroup } from "./load-material-icon-groups";

function normalizeMaterialIconSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, "_");
}

export function filterMaterialIconGroups(
  groups: readonly MaterialIconGroup[],
  query: string
): readonly MaterialIconGroup[] {
  const normalizedQuery = normalizeMaterialIconSearchQuery(query);
  if (!normalizedQuery) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      icons: group.icons.filter((icon) => icon.includes(normalizedQuery)),
    }))
    .filter((group) => group.icons.length > 0);
}
