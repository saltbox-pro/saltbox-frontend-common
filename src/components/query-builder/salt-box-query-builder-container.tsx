import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import { QueryBuilderDnD } from "@react-querybuilder/dnd";
import { Button, Flex, Spin, Switch } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { FC, ReactElement, useEffect, useState } from "react";
import * as ReactDnD from "react-dnd";
import * as ReactDndHtml5Backend from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import QueryBuilder, {
  defaultOperators,
  ValueEditorProps,
  ValueSelectorProps,
} from "react-querybuilder";

import { notify } from "../../notifications";
import { FilterStore, type QueryBuilderInputMode } from "../../store/filter-store";
import { BaseActionButton } from "../buttons/base-action-button";
import { JsonEditorField } from "../fields/json-editor-field";
import { FiltersErrorBoundary } from "../module-error-boundary/boundaries/filters-error-boundary";

import { QueryBuilderCopyFilterButton } from "./query-builder-copy-filter-button";
import { QueryBuilderSaltBox } from "./query-builder-salt-box/query-builder-salt-box";
import styles from "./salt-box-query-builder-container.module.css";
import { localizeFieldOperators, localizeOperators } from "./utils/localize-filter-operators";

export type { QueryBuilderInputMode };

type SaltBoxQueryBuilderContainerProps = {
  filterStore?: FilterStore;
  className?: string;
  additionalButtons?: ReactElement;
  hideButtons?: boolean;
  showCopyFilterButton?: boolean;
  enableFreeTextMode?: boolean;
  freeTextEditorHeight?: number;
  controlElements?: {
    valueEditor?: FC<ValueEditorProps>;
    valueSelector?: FC<ValueSelectorProps>;
  };
  onSearchButtonClick?: () => void;
  onResetButtonClick?: () => void;
  isFilterButton?: boolean;
};

export const SaltBoxQueryBuilderContainer = (props: SaltBoxQueryBuilderContainerProps) => (
  <FiltersErrorBoundary>
    <SaltBoxQueryBuilderContainerContent {...props} />
  </FiltersErrorBoundary>
);

const SaltBoxQueryBuilderContainerContent = observer((props: SaltBoxQueryBuilderContainerProps) => {
  const { t } = useTranslation("common");
  const [queryBuilderId, setQueryBuilderId] = useState(0);
  const filterStore = props.filterStore;
  const enableFreeTextMode = props.enableFreeTextMode ?? false;
  const freeTextEditorHeight = props.freeTextEditorHeight ?? 240;
  const showActions = !props.hideButtons || enableFreeTextMode;

  const getQueryBuilderKey = () => {
    if (!filterStore) {
      return `empty-${queryBuilderId}`;
    }

    if (props.isFilterButton) {
      const rulesJSON = JSON.stringify(filterStore.currentFilters.rules);
      return `rules-${queryBuilderId}-${rulesJSON}`;
    }

    const isEmpty = !filterStore.currentFilters.rules.length;
    return `${isEmpty ? "empty-" : "loaded-"}${queryBuilderId}-${filterStore.filtersRevision}`;
  };

  const handleSearchClick = () => {
    if (!filterStore) {
      return;
    }

    if (!filterStore.commitPendingInput()) {
      notify.error(t("query-builder.invalid-free-text-json"));
      return;
    }

    filterStore.handleSearch();
    props.onSearchButtonClick?.();
  };

  const handleResetClick = () => {
    filterStore?.handleResetFilters();
    props.onResetButtonClick?.();
    setQueryBuilderId((prev) => prev + 1);
  };

  const handleInputModeChange = (mode: QueryBuilderInputMode) => {
    if (!filterStore) {
      return;
    }

    if (!filterStore.switchInputMode(mode)) {
      notify.error(t("query-builder.invalid-free-text-for-builder"));
    }
  };

  useEffect(() => {
    if (!filterStore) {
      return;
    }

    setQueryBuilderId((prev) => prev + 1);
  }, [filterStore, filterStore?.currentFilters.rules.length]);

  if (!filterStore) {
    return null;
  }

  const isFreeTextMode = enableFreeTextMode && filterStore.inputMode === "free-text";

  return (
    <div className={`${styles.queryBuilderContainer} ${props.className ? props.className : ""}`}>
      <Spin spinning={filterStore.isLoading}>
        {isFreeTextMode ? (
          <div className={styles.freeTextEditor}>
            <JsonEditorField
              key={`free-text-${queryBuilderId}-${filterStore.filtersRevision}`}
              value={filterStore.freeTextQuery}
              onChange={filterStore.setFreeTextQuery}
              height={freeTextEditorHeight}
            />
          </div>
        ) : (
          <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
            <QueryBuilderSaltBox>
              <QueryBuilder
                key={getQueryBuilderKey()}
                fields={localizeFieldOperators(toJS(filterStore.filterSchema), t)}
                operators={localizeOperators(defaultOperators, t)}
                defaultQuery={toJS(filterStore.currentFilters)}
                onQueryChange={filterStore.handleFiltersChange}
                controlClassnames={{
                  queryBuilder: `${styles.queryBuilder} queryBuilder-branches`,
                }}
                controlElements={props.controlElements}
                translations={{
                  addGroup: {
                    label: t("query-builder.add-group"),
                    title: t("query-builder.add-group-title"),
                  },
                  addRule: {
                    label: t("query-builder.add-rule"),
                    title: t("query-builder.add-rule-title"),
                  },
                  removeRule: {
                    label: t("query-builder.remove-rule"),
                    title: t("query-builder.remove-rule-title"),
                  },
                  removeGroup: {
                    label: t("query-builder.remove-group"),
                    title: t("query-builder.remove-group-title"),
                  },
                }}
              />
            </QueryBuilderSaltBox>
          </QueryBuilderDnD>
        )}
      </Spin>
      {showActions && (
        <Flex
          justify={props.hideButtons ? "flex-end" : "space-between"}
          align="center"
          className={styles.actionsRow}
        >
          {!props.hideButtons && (
            <Button
              disabled={!filterStore.isSearchEnabled}
              onClick={handleSearchClick}
              icon={<SearchOutlined />}
              type="primary"
            >
              {t("query-builder.search")}
            </Button>
          )}
          <div className={styles.buttons}>
            {enableFreeTextMode && (
              <label className={styles.modeSwitch}>
                <span>{t("query-builder.mode-free-text")}</span>
                <Switch
                  size="small"
                  checked={filterStore.inputMode === "free-text"}
                  onChange={(checked) => handleInputModeChange(checked ? "free-text" : "builder")}
                />
              </label>
            )}
            {!props.hideButtons && (
              <>
                {props.showCopyFilterButton && (
                  <QueryBuilderCopyFilterButton filterStore={filterStore} size="middle" />
                )}
                <BaseActionButton
                  color="danger"
                  size="middle"
                  disabled={
                    filterStore.inputMode === "free-text"
                      ? filterStore.freeTextQuery.trim() === "{}" ||
                        filterStore.freeTextQuery.trim() === ""
                      : filterStore.currentFilters.rules.length === 0
                  }
                  onClick={handleResetClick}
                  icon={<ClearOutlined />}
                  title={t("query-builder.reset")}
                />
                {props?.additionalButtons}
              </>
            )}
          </div>
        </Flex>
      )}
    </div>
  );
});
