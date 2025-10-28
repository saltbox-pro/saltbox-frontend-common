import { FC, ReactElement, useState } from "react";
import * as ReactDnD from "react-dnd";
import * as ReactDndHtml5Backend from "react-dnd-html5-backend";
// import { useTranslation } from "react-i18next";
import QueryBuilder, {
  ValueEditorProps,
  ValueSelectorProps,
} from "react-querybuilder";
import { QueryBuilderDnD } from "@react-querybuilder/dnd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { Button, Flex, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FilterStore } from "../../store/filter-store";
import { QueryBuilderSaltBox } from "./query-builder-salt-box/query-builder-salt-box";
import { MatIcon } from "../mat-icon/mat-icon";
import styles from "./salt-box-query-builder-container.module.css";

type SaltBoxQueryBuilderContainerProps = {
  filterStore?: FilterStore;
  additionalButtons?: ReactElement;
  hideButtons?: boolean;
  controlElements?: {
    valueEditor?: FC<ValueEditorProps>;
    valueSelector?: FC<ValueSelectorProps>;
  };
  onSearchButtonClick?: () => void;
  onResetButtonClick?: () => void;
};

const t = (str: string) => str;

export const SaltBoxQueryBuilderContainer = observer(
  (props: SaltBoxQueryBuilderContainerProps) => {
    // const { t } = useTranslation();
    const [queryBuilderId, setQueryBuilderId] = useState(0);

    const getQueryBuilderKey = () => {
      const isEmpty = !props.filterStore.currentFilters.rules.length;
      return `${isEmpty ? "empty-" : "loaded-"}${queryBuilderId}`;
    };

    const handleSearchClick = () => {
      props.filterStore.handleSearch();
      props.onSearchButtonClick?.();
    };

    const handleResetClick = () => {
      props.filterStore.handleResetFilters();
      props.onResetButtonClick?.();
      setQueryBuilderId(queryBuilderId + 1);
    };

    return (
      props?.filterStore && (
        <div className={styles.queryBuilderContainer}>
          <Spin spinning={props.filterStore.isLoading}>
            <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
              <QueryBuilderSaltBox>
                <QueryBuilderSaltBox>
                  <QueryBuilder
                    key={getQueryBuilderKey()}
                    fields={toJS(props.filterStore.filterSchema)}
                    defaultQuery={toJS(props.filterStore.currentFilters)}
                    onQueryChange={props.filterStore.handleFiltersChange}
                    controlClassnames={{
                      queryBuilder: `${styles.queryBuilder} queryBuilder-branches`,
                    }}
                    controlElements={props.controlElements}
                    translations={{
                      addGroup: {
                        label: t("querybuilder-filters.add-group"),
                        title: t("querybuilder-filters.add-group-title"),
                      },
                      addRule: {
                        label: t("querybuilder-filters.add-rule"),
                        title: t("querybuilder-filters.add-rule-title"),
                      },
                      removeRule: {
                        label: t("querybuilder-filters.remove-rule"),
                        title: t("querybuilder-filters.remove-rule-title"),
                      },
                      removeGroup: {
                        label: t("querybuilder-filters.remove-group"),
                        title: t("querybuilder-filters.remove-group-title"),
                      },
                    }}
                  />
                </QueryBuilderSaltBox>
              </QueryBuilderSaltBox>
            </QueryBuilderDnD>
          </Spin>
          {!props.hideButtons && (
            <Flex justify="space-between" style={{ padding: "8px" }}>
              <Button
                disabled={!props.filterStore.isSearchEnabled}
                onClick={handleSearchClick}
                icon={<SearchOutlined />}
                type="primary"
              >
                {t("filters.search")}
              </Button>
              <div className={styles.buttons}>
                <Button
                  color="danger"
                  variant="link"
                  disabled={props.filterStore.currentFilters.rules.length === 0}
                  onClick={handleResetClick}
                  icon={<MatIcon icon="filter_alt_off" />}
                  title={t("minions.reset")}
                />
                {props?.additionalButtons}
              </div>
            </Flex>
          )}
        </div>
      )
    );
  }
);
