import { SyncOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { BaseActionButton, type BaseActionButtonProps } from "../../base-action-button";

export type RefreshButtonProps = Omit<BaseActionButtonProps, "icon" | "title"> & {
  title?: string | false;
};

export function RefreshButton({ title, size = "middle", ...restProps }: RefreshButtonProps) {
  const { t } = useTranslation("common");

  return (
    <BaseActionButton
      icon={<SyncOutlined />}
      title={title === false ? undefined : (title ?? t("refresh-button.refresh"))}
      size={size}
      {...restProps}
    />
  );
}
