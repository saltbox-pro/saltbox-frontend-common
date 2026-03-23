import { action, makeObservable } from "mobx";
import { OptionList, RuleGroupType } from "react-querybuilder";

import { emptyRuleGroup, generateIdsForQuery } from "../utils/query-builder-utils";

import { FilterStore } from "./filter-store";

export class PersistentFilterStore extends FilterStore {
  private readonly storageKey: string | undefined;

  constructor(filterSchema: OptionList = [], storageKey?: string) {
    super();
    this.filterSchema = filterSchema;
    this.storageKey = storageKey;
    if (storageKey) {
      this.loadFromStorage();
    }
    makeObservable(this);
  }

  override handleSearch = () => {
    if (this.storageKey) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentFilters));
      } catch {}
    }
    this.searchFilters = this.currentFilters;
  };

  override handleResetFilters = () => {
    if (this.storageKey) {
      try {
        localStorage.removeItem(this.storageKey);
      } catch {}
    }
    this.currentFilters = emptyRuleGroup;
    this.searchFilters = emptyRuleGroup;
  };

  @action
  private loadFromStorage(): void {
    if (!this.storageKey) return;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as RuleGroupType;
        const withIds = generateIdsForQuery(parsed);
        this.currentFilters = withIds;
        this.searchFilters = withIds;
      }
    } catch {}
  }
}
