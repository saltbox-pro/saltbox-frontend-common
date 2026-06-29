import { CopyOutlined } from "@ant-design/icons";
import { type ButtonProps, message } from "antd";
import { useTranslation } from "react-i18next";

import { BaseActionButton } from "../base-action-button/base-action-button";

interface CopyToClipboardButtonProps extends Omit<ButtonProps, "icon"> {
  text: string;
  successMessage?: string;
  errorMessage?: string;
}

export function CopyToClipboardButton({
  text,
  successMessage,
  errorMessage,
  title,
  onClick,
  ...restProps
}: CopyToClipboardButtonProps) {
  const { t } = useTranslation("common");
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy: ButtonProps["onClick"] = (e) => {
    e?.stopPropagation?.();
    onClick?.(e);

    const value = String(text ?? "");
    navigator.clipboard
      .writeText(value)
      .then(() => {
        messageApi.success(successMessage ?? t("copy-to-clipboard-button.copied"));
      })
      .catch(() => {
        messageApi.error(errorMessage ?? t("copy-to-clipboard-button.error"));
      });
  };

  return (
    <>
      {contextHolder}
      <BaseActionButton
        icon={<CopyOutlined />}
        title={title ?? t("copy-to-clipboard-button.copy")}
        onClick={handleCopy}
        {...restProps}
      />
    </>
  );
}
