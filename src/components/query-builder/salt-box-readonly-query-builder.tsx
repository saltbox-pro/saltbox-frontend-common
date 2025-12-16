import { Spin } from "antd";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import QueryBuilder from "react-querybuilder";

import { FilterStore } from "../../store/filter-store";

import { QueryBuilderSaltBox } from "./query-builder-salt-box/query-builder-salt-box";
import styles from "./salt-box-readonly-query-builder.module.css";
import { SaltBoxReadonlyValueEditor } from "./value-editors/salt-box-readonly-value-editor";
import { SaltBoxReadonlyValueSelector } from "./value-selectors/salt-box-readonly-value-selector";

type SaltBoxReadonlyQueryBuilderProps = {
  filterStore: FilterStore;
};

const EmptyActionElement = () => null;

export const SaltBoxReadonlyQueryBuilder = observer((props: SaltBoxReadonlyQueryBuilderProps) => {
  return (
    <div className={styles.queryBuilderContainer}>
      <Spin spinning={props.filterStore.isLoading}>
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
      </Spin>
    </div>
  );
});
