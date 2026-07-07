import { FilterOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { BaseActionButton, type BaseActionButtonProps } from "../../base-action-button";

export type FilterActionButtonProps = Omit<BaseActionButtonProps, "icon" | "title"> & {
  title?: string;
};

export function FilterActionButton({ title, ...restProps }: FilterActionButtonProps) {
  const { t } = useTranslation("common");
  return (
    <BaseActionButton
      icon={<FilterOutlined />}
      title={title ?? t("action-button.apply-filter")}
      {...restProps}
    />
  );
}
