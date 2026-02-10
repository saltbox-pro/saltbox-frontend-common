import { ExportOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  BaseActionButton,
  type BaseActionButtonProps,
} from "../base-action-button/base-action-button";

export type ActionLinkButtonProps = Omit<
  BaseActionButtonProps,
  "icon" | "title" | "href" | "target"
> & {
  href: string;
  icon?: ReactNode;
  title?: string;
  target?: "_blank" | "_self";
};

export function ActionLinkButton({
  href,
  icon,
  title,
  target = "_blank",
  ...restProps
}: ActionLinkButtonProps) {
  const { t } = useTranslation("common");
  return (
    <BaseActionButton
      icon={icon ?? <ExportOutlined />}
      title={title ?? t("action-button.open-link")}
      href={href}
      target={target}
      {...restProps}
    />
  );
}
