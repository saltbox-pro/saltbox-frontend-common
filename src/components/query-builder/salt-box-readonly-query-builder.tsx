import { Flex, Spin } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import QueryBuilder from "react-querybuilder";

import { FilterStore } from "../../store/filter-store";

import { QueryBuilderCopyFilterButton } from "./query-builder-copy-filter-button";
import { QueryBuilderSaltBox } from "./query-builder-salt-box/query-builder-salt-box";
import styles from "./salt-box-readonly-query-builder.module.css";
import { SaltBoxReadonlyValueEditor } from "./value-editors/salt-box-readonly-value-editor";
import { SaltBoxReadonlyValueSelector } from "./value-selectors/salt-box-readonly-value-selector";

type SaltBoxReadonlyQueryBuilderProps = {
  filterStore: FilterStore;
  title?: string;
  showCopyFilterButton?: boolean;
};

const EmptyActionElement = () => null;

export const SaltBoxReadonlyQueryBuilder = observer((props: SaltBoxReadonlyQueryBuilderProps) => {
  const showHeader = Boolean(props.title) || props.showCopyFilterButton;

  return (
    <div className={styles.queryBuilderContainer}>
      {showHeader && (
        <Flex align="center" gap="small" className={styles.header}>
          {props.title && <strong className={styles.title}>{props.title}</strong>}
          {props.showCopyFilterButton && (
            <QueryBuilderCopyFilterButton filterStore={props.filterStore} />
          )}
        </Flex>
      )}

      {props.filterStore.isLoading ? (
        <Flex justify="center" className={styles.spinContainer}>
          <Spin />
        </Flex>
      ) : (
        <QueryBuilderSaltBox>
          <QueryBuilderSaltBox>
            <QueryBuilder
              fields={toJS(props.filterStore.filterSchema)}
              query={toJS(props.filterStore.currentFilters)}
              controlClassnames={{
                queryBuilder: `${styles.queryBuilder} queryBuilder-branches`,
                ruleGroup: "readonly-rule-group",
                rule: "readonly-rule",
              }}
              controlElements={{
                valueEditor: SaltBoxReadonlyValueEditor,
                valueSelector: SaltBoxReadonlyValueSelector,
                addGroupAction: EmptyActionElement,
                addRuleAction: EmptyActionElement,
                removeRuleAction: EmptyActionElement,
                removeGroupAction: EmptyActionElement,
              }}
            />
          </QueryBuilderSaltBox>
        </QueryBuilderSaltBox>
      )}
    </div>
  );
});
