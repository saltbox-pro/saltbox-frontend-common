import { action, computed, observable, toJS } from "mobx";
import { formatQuery, OptionList, RuleGroupType } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";

import {
  emptyRuleGroup,
  formatToMongoDB,
  generateIdsForQuery,
  isMongoQueryEmpty,
  parseCaseInsensitiveQuery,
} from "../utils/query-builder-utils";

type MongoQueryCache = { key: string; value: object };

export type QueryBuilderInputMode = "builder" | "free-text";

export class FilterStore {
  @observable currentFilters: RuleGroupType = emptyRuleGroup;
  @observable searchFilters: RuleGroupType = emptyRuleGroup;
  @observable isLoading: boolean = false;
  @observable filterSchema: OptionList = [];
  @observable filtersRevision: number = 0;
  @observable inputMode: QueryBuilderInputMode = "builder";
  @observable freeTextQuery: string = "{}";
  private _searchQueryCache: MongoQueryCache = { key: "", value: {} };
  private _currentQueryCache: MongoQueryCache = { key: "", value: {} };

  @computed
  get activeFiltersCount(): number {
    return this.getRulesCount(this.searchFilters);
  }

  @computed
  get isSearchEnabled() {
    if (this.inputMode === "free-text") {
      try {
        const parsed = JSON.parse(this.freeTextQuery) as object;
        const applied = this.searchMongoDBQuery;
        if (isMongoQueryEmpty(parsed) && isMongoQueryEmpty(applied)) {
          return false;
        }
        return JSON.stringify(parsed) !== JSON.stringify(applied);
      } catch {
        return true;
      }
    }

    return (
      formatQuery(this.currentFilters, "json_without_ids") !==
      formatQuery(this.searchFilters, "json_without_ids")
    );
  }

  @action
  handleFiltersChange = (filters: RuleGroupType) => {
    if (this.isSameQuery(filters, this.currentFilters)) {
      return;
    }

    this.currentFilters = filters;
  };

  @action
  handleResetFilters = () => {
    this.currentFilters = emptyRuleGroup;
    this.freeTextQuery = "{}";
    this.filtersRevision += 1;
    this.handleSearch();
  };

  @action
  handleResetFiltersSilent = () => {
    this.currentFilters = emptyRuleGroup;
    this.freeTextQuery = "{}";
    this.filtersRevision += 1;
  };

  @action
  handleSearch = () => {
    this.searchFilters = this.currentFilters;
  };

  @action
  updateFilterSchema = (filterSchema: OptionList) => {
    this.filterSchema = filterSchema;
  };

  @computed
  get searchMongoDBQuery(): object {
    return this.buildMongoDBQuery(this.searchFilters, this._searchQueryCache);
  }

  @computed
  get currentMongoDBQuery(): object {
    return this.buildMongoDBQuery(this.currentFilters, this._currentQueryCache);
  }

  @action
  setFreeTextQuery = (value: string) => {
    this.freeTextQuery = value;
  };

  @action
  resetInputMode = () => {
    this.inputMode = "builder";
  };

  @action
  commitPendingInput = (): boolean => {
    if (this.inputMode !== "free-text") {
      return true;
    }

    try {
      const parsed = JSON.parse(this.freeTextQuery) as object;
      this.currentFilters = isMongoQueryEmpty(parsed)
        ? emptyRuleGroup
        : generateIdsForQuery(parseMongoDB(parseCaseInsensitiveQuery(parsed)));
      this.filtersRevision += 1;
      return true;
    } catch {
      return false;
    }
  };

  @action
  switchInputMode = (mode: QueryBuilderInputMode): boolean => {
    if (mode === this.inputMode) {
      return true;
    }

    if (mode === "free-text") {
      const query = this.currentMongoDBQuery ?? {};
      this.freeTextQuery = JSON.stringify(isMongoQueryEmpty(query) ? {} : query, null, 2);
      this.inputMode = "free-text";
      return true;
    }

    if (!this.commitPendingInput()) {
      return false;
    }

    this.inputMode = "builder";
    return true;
  };

  @action
  initializeByQuery = (query: object) => {
    this.currentFilters = isMongoQueryEmpty(query)
      ? emptyRuleGroup
      : generateIdsForQuery(parseMongoDB(parseCaseInsensitiveQuery(query)));
    this.freeTextQuery = JSON.stringify(isMongoQueryEmpty(query) ? {} : (query ?? {}), null, 2);
    this.filtersRevision += 1;
    this.handleSearch();
  };

  private isSameQuery(left: RuleGroupType, right: RuleGroupType): boolean {
    return formatQuery(left, "json_without_ids") === formatQuery(right, "json_without_ids");
  }

  private buildMongoDBQuery(filters: RuleGroupType, cache: MongoQueryCache): object {
    const currentQueryString = formatQuery(filters, "json_without_ids");
    const fields = toJS(this.filterSchema);
    const schemaKey = fields.length > 0 ? JSON.stringify(fields) : "";
    const cacheKey = `${currentQueryString}|${schemaKey}`;

    if (cacheKey !== cache.key) {
      cache.key = cacheKey;
      cache.value = formatToMongoDB(filters, fields);
    }
    return cache.value;
  }

  private getRulesCount = (group: RuleGroupType): number => {
    if (!group?.rules || !Array.isArray(group.rules)) {
      return 0;
    }

    return group.rules.reduce((count, rule) => {
      if (rule && typeof rule === "object" && "rules" in rule) {
        return count + this.getRulesCount(rule as RuleGroupType);
      }

      return count + 1;
    }, 0);
  };
}
