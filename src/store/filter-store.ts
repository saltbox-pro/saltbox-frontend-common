import { OptionList, RuleGroupType, formatQuery } from "react-querybuilder";
import { parseMongoDB } from 'react-querybuilder/parseMongoDB';
import { action, computed, observable } from "mobx";
import { customRuleProcessorMongoDB, generateIdsForQuery } from "../utils/query-builder-utils";

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

  @computed
  get searchMongoDBQuery(): object {
    return JSON.parse(
      formatQuery(this.searchFilters, {
        format: 'mongodb',
        valueProcessor: customRuleProcessorMongoDB,
      }),
    );
  }

  @action
  initializeByQuery = (query: object) => {
    this.currentFilters = generateIdsForQuery(parseMongoDB(query));
    this.handleSearch();
  };
}
