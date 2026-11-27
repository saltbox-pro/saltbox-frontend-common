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
  const isFreeText = filterStore.inputMode === "free-text";
  const text = isFreeText
    ? filterStore.freeTextQuery
    : JSON.stringify(filterStore.currentMongoDBQuery, null, 2);
  const isEmpty = isFreeText ? !text.trim() : isMongoQueryEmpty(filterStore.currentMongoDBQuery);

  return (
    <CopyToClipboardButton
      {...restProps}
      text={text}
      disabled={disabled ?? isEmpty}
      successMessage={successMessage ?? t("query-builder.filter-copied")}
    />
  );
});
