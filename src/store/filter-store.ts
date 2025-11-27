import { OptionList, RuleGroupType, formatQuery } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";
import { action, computed, observable } from "mobx";
import {
  customRuleProcessorMongoDB,
  generateIdsForQuery,
} from "../utils/query-builder-utils";

const emptyFilters: RuleGroupType = {
  rules: [],
  combinator: "and",
  not: false,
};

export class FilterStore {
  @observable currentFilters: RuleGroupType = emptyFilters;
  @observable searchFilters: RuleGroupType = emptyFilters;
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
    this.currentFilters = emptyFilters;
    this.handleSearch();
  };

  @action
  handleSearch = () => {
    this.searchFilters = this.currentFilters;
  };

  @action
  updateFilterSchema = (filterSchema: OptionList) => {
    this.filterSchema = filterSchema;
  }

  @computed
  get searchMongoDBQuery(): object {
    const currentQueryString = this.searchMongoDBQueryString;
    if (currentQueryString !== this._queryCache.key) {
      this._queryCache = {
        key: currentQueryString,
        value: JSON.parse(currentQueryString),
      }
    }
    return this._queryCache.value;
  }

  @action
  initializeByQuery = (query: object) => {
    this.currentFilters = generateIdsForQuery(parseMongoDB(query));
    this.handleSearch();
  };

  @computed
  private get searchMongoDBQueryString(): string {
    return formatQuery(this.searchFilters, {
      format: "mongodb",
      valueProcessor: customRuleProcessorMongoDB,
    });
  }
}
