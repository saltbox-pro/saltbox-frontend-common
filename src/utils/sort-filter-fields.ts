import type { OptionList } from "react-querybuilder";

import { isOptionGroup } from "./filter-schema-field";

type SortableFieldItem = { label?: string; name?: string };

const CYRILLIC_START = /^\p{Script=Cyrillic}/u;

function getSortLabel(item: SortableFieldItem): string {
  return item.label || item.name || "";
}

function getScriptRank(label: string): number {
  return CYRILLIC_START.test(label) ? 1 : 0;
}

export function createFilterLabelComparator(locale?: string): (a: string, b: string) => number {
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });

  return (a, b) => getScriptRank(a) - getScriptRank(b) || collator.compare(a, b);
}

function createFieldComparator(locale?: string) {
  const compareLabels = createFilterLabelComparator(locale);

  return (a: SortableFieldItem, b: SortableFieldItem): number =>
    compareLabels(getSortLabel(a), getSortLabel(b)) || compareLabels(a.name ?? "", b.name ?? "");
}

export function sortFilterFieldsByLabel(fields: OptionList, locale?: string): OptionList {
  const compare = createFieldComparator(locale);

  const sortItems = (items: readonly SortableFieldItem[]): SortableFieldItem[] =>
    items
      .map((item) =>
        isOptionGroup(item)
          ? { ...item, options: sortItems(item.options as SortableFieldItem[]) }
          : item
      )
      .sort(compare);

  return sortItems(fields) as OptionList;
}
