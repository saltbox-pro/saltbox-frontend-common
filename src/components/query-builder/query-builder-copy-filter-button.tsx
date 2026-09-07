import { type ButtonProps } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { FilterStore } from "../../store/filter-store";
import { isMongoQueryEmpty } from "../../utils/query-builder-utils";
import { CopyToClipboardButton } from "../buttons/copy-to-clipboard-button";

type QueryBuilderCopyFilterButtonProps = Omit<ButtonProps, "icon" | "children"> & {
  filterStore: FilterStore;
  successMessage?: string;
};

export const QueryBuilderCopyFilterButton = observer(function QueryBuilderCopyFilterButton({
  filterStore,
  successMessage,
  disabled,
  ...restProps
}: QueryBuilderCopyFilterButtonProps) {
  const { t } = useTranslation("common");
  const query = filterStore.currentMongoDBQuery;

  return (
    <CopyToClipboardButton
      {...restProps}
      text={JSON.stringify(query, null, 2)}
      disabled={disabled ?? isMongoQueryEmpty(query)}
      successMessage={successMessage ?? t("query-builder.filter-copied")}
    />
  );
});
