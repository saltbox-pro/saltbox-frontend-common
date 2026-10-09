import { type OptionList, type RuleGroupType } from "react-querybuilder";

import { buildFilterByValueRule } from "./filter-by-value-rule";
import { getFilterFieldOptions, type FilterFieldOptions } from "./filter-schema-field";
import {
  hasFilterRule,
  toggleFilterRule,
  type FilterRuleIdentity,
  type ToggleFilterRuleMode,
} from "./toggle-filter-rule";

type FilterByValueLookup = {
  filterSchema: OptionList;
  currentFilters: RuleGroupType;
};

type FilterByValueStore = FilterByValueLookup & {
  bumpFiltersRevision: () => void;
  handleFiltersChange: (filters: RuleGroupType) => void;
  handleSearch: () => void;
};

export type ApplyFilterByValueOptions = {
  search?: boolean;
  fieldOptions?: FilterFieldOptions;
  mode?: ToggleFilterRuleMode;
};

export type ApplyFilterByValueResult =
  | { ok: false; reason: "unsupported" }
  | { ok: true; result: "added" | "removed" };

function resolveFieldOptions(
  filterStore: Pick<FilterByValueLookup, "filterSchema">,
  field: string,
  fieldOptions?: FilterFieldOptions
): FilterFieldOptions {
  return fieldOptions ?? getFilterFieldOptions(filterStore.filterSchema, field);
}

function buildRule(
  filterStore: Pick<FilterByValueLookup, "filterSchema">,
  field: string,
  value: unknown,
  fieldOptions?: FilterFieldOptions
): FilterRuleIdentity | null {
  return buildFilterByValueRule(
    field,
    value,
    resolveFieldOptions(filterStore, field, fieldOptions)
  );
}

export function canApplyFilterByValue(
  filterStore: Pick<FilterByValueLookup, "filterSchema">,
  field: string,
  value: unknown,
  fieldOptions?: FilterFieldOptions
): boolean {
  return buildRule(filterStore, field, value, fieldOptions) != null;
}

export function hasFilterByValue(
  filterStore: FilterByValueLookup,
  field: string,
  value: unknown,
  fieldOptions?: FilterFieldOptions
): boolean {
  const identity = buildRule(filterStore, field, value, fieldOptions);
  if (!identity) {
    return false;
  }

  return hasFilterRule(filterStore.currentFilters, identity);
}

export function applyFilterByValue(
  filterStore: FilterByValueStore,
  field: string,
  value: unknown,
  options: ApplyFilterByValueOptions = {}
): ApplyFilterByValueResult {
  const identity = buildRule(filterStore, field, value, options.fieldOptions);
  if (!identity) {
    return { ok: false, reason: "unsupported" };
  }

  const { group, result } = toggleFilterRule(
    filterStore.currentFilters,
    identity,
    options.mode ?? "append"
  );
  filterStore.handleFiltersChange(group);
  filterStore.bumpFiltersRevision();

  if (options.search ?? false) {
    filterStore.handleSearch();
  }

  return { ok: true, result };
}
