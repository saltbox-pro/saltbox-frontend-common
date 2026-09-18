import { action, computed, observable, toJS } from "mobx";
import { formatQuery, OptionList, RuleGroupType } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";

import {
  emptyRuleGroup,
  formatToMongoDB,
  generateIdsForQuery,
  parseCaseInsensitiveQuery,
} from "../utils/query-builder-utils";

type MongoQueryCache = { key: string; value: object };

export class FilterStore {
  @observable currentFilters: RuleGroupType = emptyRuleGroup;
  @observable searchFilters: RuleGroupType = emptyRuleGroup;
  @observable isLoading: boolean = false;
  @observable filterSchema: OptionList = [];
  @observable filtersRevision: number = 0;
  private _searchQueryCache: MongoQueryCache = { key: "", value: {} };
  private _currentQueryCache: MongoQueryCache = { key: "", value: {} };

  @computed
  get activeFiltersCount(): number {
    return this.getRulesCount(this.searchFilters);
  }

  @computed
  get isSearchEnabled() {
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
    this.handleSearch();
  };

  @action
  handleResetFiltersSilent = () => {
    this.currentFilters = emptyRuleGroup;
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
  initializeByQuery = (query: object) => {
    this.currentFilters = generateIdsForQuery(parseMongoDB(parseCaseInsensitiveQuery(query)));
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
