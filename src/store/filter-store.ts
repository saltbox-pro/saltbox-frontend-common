import { action, computed, observable, toJS } from "mobx";
import { formatQuery, OptionList, RuleGroupType } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";

import {
  emptyRuleGroup,
  filtersFromMongoQuery,
  formatToMongoDB,
  freeTextFilterQueryHasTypeErrors,
  generateIdsForQuery,
  isMongoQueryEmpty,
  parseCaseInsensitiveQuery,
} from "../utils/query-builder-utils";

type MongoQueryCache = { key: string; value: object };
type FreeTextParseCache = { key: string; parsed: object | null };

export type QueryBuilderInputMode = "builder" | "free-text";

export type FreeTextCommitFailureReason = "invalid-json" | "schema-validation" | "unparseable";

export type CommitPendingInputResult =
  | { ok: true }
  | { ok: false; reason: FreeTextCommitFailureReason };

export function freeTextErrorI18nKey(reason: FreeTextCommitFailureReason): string {
  switch (reason) {
    case "invalid-json":
      return "query-builder.invalid-free-text-json";
    case "schema-validation":
      return "query-builder.invalid-free-text";
    case "unparseable":
      return "query-builder.invalid-free-text-for-builder";
  }
}

export class FilterStore {
  @observable currentFilters: RuleGroupType = emptyRuleGroup;
  @observable searchFilters: RuleGroupType = emptyRuleGroup;
  @observable isLoading: boolean = false;
  @observable filterSchema: OptionList = [];
  @observable filtersRevision: number = 0;
  @observable inputMode: QueryBuilderInputMode = "builder";
  @observable freeTextQuery: string = "{}";
  @observable freeTextHasValidationErrors: boolean = false;
  private _searchQueryCache: MongoQueryCache = { key: "", value: {} };
  private _currentQueryCache: MongoQueryCache = { key: "", value: {} };
  private _freeTextParseCache: FreeTextParseCache = { key: "", parsed: null };

  @computed
  get activeFiltersCount(): number {
    return this.getRulesCount(this.searchFilters);
  }

  @computed
  get freeTextBlockingErrorReason(): FreeTextCommitFailureReason | null {
    if (this.inputMode !== "free-text") {
      return null;
    }

    const parsed = this.getParsedFreeTextQuery();
    if (parsed == null) {
      return "invalid-json";
    }

    if (isMongoQueryEmpty(parsed)) {
      return null;
    }

    if (
      this.freeTextHasValidationErrors ||
      freeTextFilterQueryHasTypeErrors(parsed, toJS(this.filterSchema))
    ) {
      return "schema-validation";
    }

    if (filtersFromMongoQuery(parsed) == null) {
      return "unparseable";
    }

    return null;
  }

  @computed
  get isSearchEnabled() {
    if (this.inputMode === "free-text") {
      if (this.freeTextBlockingErrorReason != null) {
        return false;
      }

      const parsed = this.getParsedFreeTextQuery();
      if (parsed == null) {
        return false;
      }

      return this.isMongoQueryChanged(parsed);
    }

    // Compare mongo form, not raw rules: free-text roundtrip (datetime ISO, checkbox
    // booleans, etc.) can rewrite rule values without changing the applied query.
    return this.isMongoQueryChanged(this.currentMongoDBQuery);
  }

  @action
  handleFiltersChange = (filters: RuleGroupType) => {
    if (this.isSameQuery(filters, this.currentFilters)) {
      return;
    }

    this.currentFilters = filters;
  };

  @action
  bumpFiltersRevision = () => {
    this.filtersRevision += 1;
  };

  @action
  handleResetFilters = () => {
    this.currentFilters = emptyRuleGroup;
    this.freeTextQuery = "{}";
    this.freeTextHasValidationErrors = false;
    this.bumpFiltersRevision();
    this.handleSearch();
  };

  @action
  handleResetFiltersSilent = () => {
    this.currentFilters = emptyRuleGroup;
    this.freeTextQuery = "{}";
    this.freeTextHasValidationErrors = false;
    this.bumpFiltersRevision();
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

    try {
      if (isMongoQueryEmpty(JSON.parse(value) as object)) {
        this.freeTextHasValidationErrors = false;
      }
    } catch {
      // keep current validation flag until Monaco onValidate / sync check
    }
  };

  @action
  setFreeTextHasValidationErrors = (hasErrors: boolean) => {
    this.freeTextHasValidationErrors = hasErrors;
  };

  @action
  resetInputMode = () => {
    this.inputMode = "builder";
    this.freeTextHasValidationErrors = false;
  };

  @action
  commitPendingInput = (): CommitPendingInputResult => {
    if (this.inputMode !== "free-text") {
      return { ok: true };
    }

    const parsed = this.getParsedFreeTextQuery();
    if (parsed == null) {
      return { ok: false, reason: "invalid-json" };
    }

    if (isMongoQueryEmpty(parsed)) {
      this.freeTextHasValidationErrors = false;
      this.currentFilters = emptyRuleGroup;
      this.bumpFiltersRevision();
      return { ok: true };
    }

    if (
      this.freeTextHasValidationErrors ||
      freeTextFilterQueryHasTypeErrors(parsed, toJS(this.filterSchema))
    ) {
      this.freeTextHasValidationErrors = true;
      return { ok: false, reason: "schema-validation" };
    }

    const filters = filtersFromMongoQuery(parsed);
    if (!filters) {
      return { ok: false, reason: "unparseable" };
    }

    this.freeTextHasValidationErrors = false;
    this.currentFilters = filters;
    this.bumpFiltersRevision();
    return { ok: true };
  };

  @action
  switchInputMode = (mode: QueryBuilderInputMode): CommitPendingInputResult => {
    if (mode === this.inputMode) {
      return { ok: true };
    }

    if (mode === "free-text") {
      const query = this.isMongoQueryChanged(this.currentMongoDBQuery)
        ? (this.currentMongoDBQuery ?? {})
        : (this.searchMongoDBQuery ?? {});
      this.freeTextQuery = JSON.stringify(isMongoQueryEmpty(query) ? {} : query, null, 2);
      this.freeTextHasValidationErrors = false;
      this.inputMode = "free-text";
      return { ok: true };
    }

    const committed = this.commitPendingInput();
    if (!committed.ok) {
      return committed;
    }

    this.freeTextHasValidationErrors = false;
    this.inputMode = "builder";
    return { ok: true };
  };

  @action
  initializeByQuery = (query: object) => {
    const isEmpty = isMongoQueryEmpty(query);
    this.currentFilters = isEmpty
      ? emptyRuleGroup
      : generateIdsForQuery(parseMongoDB(parseCaseInsensitiveQuery(query)));
    this.freeTextQuery = JSON.stringify(isEmpty ? {} : (query ?? {}), null, 2);
    this.freeTextHasValidationErrors = false;
    this.bumpFiltersRevision();
    this.handleSearch();
  };

  private getParsedFreeTextQuery(): object | null {
    const key = this.freeTextQuery;
    if (this._freeTextParseCache.key !== key) {
      this._freeTextParseCache.key = key;
      try {
        this._freeTextParseCache.parsed = JSON.parse(key) as object;
      } catch {
        this._freeTextParseCache.parsed = null;
      }
    }

    return this._freeTextParseCache.parsed;
  }

  private isSameQuery(left: RuleGroupType, right: RuleGroupType): boolean {
    return formatQuery(left, "json_without_ids") === formatQuery(right, "json_without_ids");
  }

  private isMongoQueryChanged(candidate: object): boolean {
    const applied = this.searchMongoDBQuery;
    if (isMongoQueryEmpty(candidate) && isMongoQueryEmpty(applied)) {
      return false;
    }
    return JSON.stringify(candidate) !== JSON.stringify(applied);
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
