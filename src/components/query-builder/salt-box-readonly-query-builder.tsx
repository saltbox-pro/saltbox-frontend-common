import { Flex, Spin } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import QueryBuilder, { defaultOperators } from "react-querybuilder";

import { FilterStore } from "../../store/filter-store";

import { QueryBuilderCopyFilterButton } from "./query-builder-copy-filter-button";
import { QueryBuilderNegationLabel } from "./query-builder-negation-label";
import { QueryBuilderSaltBox } from "./query-builder-salt-box/query-builder-salt-box";
import styles from "./salt-box-readonly-query-builder.module.css";
import { localizeFieldOperators, localizeOperators } from "./utils/localize-filter-operators";
import { useQueryBuilderItemCombinators } from "./utils/use-query-builder-item-combinators";
import { SaltBoxReadonlyValueEditor } from "./value-editors/salt-box-readonly-value-editor";
import { SaltBoxReadonlyValueSelector } from "./value-selectors/salt-box-readonly-value-selector";

type SaltBoxReadonlyQueryBuilderProps = {
  filterStore: FilterStore;
  title?: string;
  showCopyFilterButton?: boolean;
  enableItemCombinators?: boolean;
};

const EmptyActionElement = () => null;

export const SaltBoxReadonlyQueryBuilder = observer((props: SaltBoxReadonlyQueryBuilderProps) => {
  const { t } = useTranslation("common");
  const showHeader = Boolean(props.title) || props.showCopyFilterButton;
  const itemCombinators = useQueryBuilderItemCombinators(props.enableItemCombinators ?? false);

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
      ) : props.filterStore.inputMode === "free-text" ? (
        <pre>{props.filterStore.freeTextQuery}</pre>
      ) : (
        <QueryBuilderSaltBox>
          <QueryBuilder
            fields={localizeFieldOperators(toJS(props.filterStore.filterSchema), t)}
            operators={localizeOperators(defaultOperators, t)}
            disabled
            showNotToggle={props.enableItemCombinators}
            combinators={itemCombinators}
            query={toJS(props.filterStore.currentFilters)}
            controlClassnames={{
              queryBuilder: `${styles.queryBuilder} queryBuilder-branches`,
              ruleGroup: "readonly-rule-group",
              rule: "readonly-rule",
            }}
            controlElements={{
              notToggle: QueryBuilderNegationLabel,
              valueEditor: SaltBoxReadonlyValueEditor,
              valueSelector: SaltBoxReadonlyValueSelector,
              addGroupAction: EmptyActionElement,
              addRuleAction: EmptyActionElement,
              removeRuleAction: EmptyActionElement,
              removeGroupAction: EmptyActionElement,
            }}
          />
        </QueryBuilderSaltBox>
      )}
    </div>
  );
});
