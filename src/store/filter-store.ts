import { action, computed, observable, toJS } from "mobx";
import { formatQuery, OptionList, RuleGroupType } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";

import { emptyRuleGroup, formatToMongoDB, generateIdsForQuery } from "../utils/query-builder-utils";

export class FilterStore {
  @observable currentFilters: RuleGroupType = emptyRuleGroup;
  @observable searchFilters: RuleGroupType = emptyRuleGroup;
  @observable isLoading: boolean = false;
  @observable filterSchema: OptionList = [];
  private _queryCache = { key: "", value: {} };

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
    const currentQueryString = formatQuery(this.searchFilters, "json_without_ids");
    const fields = toJS(this.filterSchema);
    const schemaKey = fields.length > 0 ? JSON.stringify(fields) : "";
    const cacheKey = `${currentQueryString}|${schemaKey}`;

    if (cacheKey !== this._queryCache.key) {
      this._queryCache = {
        key: cacheKey,
        value: formatToMongoDB(this.searchFilters, fields),
      };
    }
    return this._queryCache.value;
  }

  @action
  initializeByQuery = (query: object) => {
    this.currentFilters = generateIdsForQuery(parseMongoDB(query));
    this.handleSearch();
  };

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
