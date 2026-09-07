import { SearchOutlined } from "@ant-design/icons";
import { QueryBuilderDnD } from "@react-querybuilder/dnd";
import { Button, Flex, Spin } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { FC, ReactElement, useEffect, useState } from "react";
import * as ReactDnD from "react-dnd";
import * as ReactDndHtml5Backend from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import QueryBuilder, { ValueEditorProps, ValueSelectorProps } from "react-querybuilder";

import { FilterStore } from "../../store/filter-store";
import { MatIcon } from "../mat-icon/mat-icon";
import { FiltersErrorBoundary } from "../module-error-boundary/boundaries/filters-error-boundary";

import { QueryBuilderCopyFilterButton } from "./query-builder-copy-filter-button";
import { QueryBuilderSaltBox } from "./query-builder-salt-box/query-builder-salt-box";
import styles from "./salt-box-query-builder-container.module.css";

type SaltBoxQueryBuilderContainerProps = {
  filterStore?: FilterStore;
  additionalButtons?: ReactElement;
  hideButtons?: boolean;
  showCopyFilterButton?: boolean;
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

  const getQueryBuilderKey = () => {
    if (!filterStore) {
      return `empty-${queryBuilderId}`;
    }

    if (props.isFilterButton) {
      const rulesJSON = JSON.stringify(filterStore.currentFilters.rules);
      return `rules-${queryBuilderId}-${rulesJSON}`;
    }

    const isEmpty = !filterStore.currentFilters.rules.length;
    return `${isEmpty ? "empty-" : "loaded-"}${queryBuilderId}`;
  };

  const handleSearchClick = () => {
    filterStore?.handleSearch();
    props.onSearchButtonClick?.();
  };

  const handleResetClick = () => {
    filterStore?.handleResetFilters();
    props.onResetButtonClick?.();
    setQueryBuilderId((prev) => prev + 1);
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

  return (
    <div className={styles.queryBuilderContainer}>
      <Spin spinning={filterStore.isLoading}>
        <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
          <QueryBuilderSaltBox>
            <QueryBuilder
              key={getQueryBuilderKey()}
              fields={toJS(filterStore.filterSchema)}
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
      </Spin>
      {!props.hideButtons && (
        <Flex justify="space-between" style={{ padding: "8px" }}>
          <Button
            disabled={!filterStore.isSearchEnabled}
            onClick={handleSearchClick}
            icon={<SearchOutlined />}
            type="primary"
          >
            {t("query-builder.search")}
          </Button>
          <div className={styles.buttons}>
            {props.showCopyFilterButton && (
              <QueryBuilderCopyFilterButton filterStore={filterStore} />
            )}
            <Button
              color="danger"
              variant="link"
              disabled={filterStore.currentFilters.rules.length === 0}
              onClick={handleResetClick}
              icon={<MatIcon icon="filter_alt_off" />}
              title={t("query-builder.reset")}
            />
            {props?.additionalButtons}
          </div>
        </Flex>
      )}
    </div>
  );
});
