import { action, computed, observable } from "mobx";
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
    if (currentQueryString !== this._queryCache.key) {
      this._queryCache = {
        key: currentQueryString,
        value: formatToMongoDB(this.searchFilters),
      };
    }
    return this._queryCache.value;
  }

  @action
  initializeByQuery = (query: object) => {
    this.currentFilters = generateIdsForQuery(parseMongoDB(query));
    this.handleSearch();
  };
}
