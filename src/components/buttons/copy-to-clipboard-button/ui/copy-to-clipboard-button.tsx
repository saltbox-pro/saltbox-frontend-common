import { CopyOutlined } from "@ant-design/icons";
import { type ButtonProps } from "antd";
import { useTranslation } from "react-i18next";

import { notify } from "../../../../error-handling/notify";
import { BaseActionButton } from "../../base-action-button";

interface CopyToClipboardButtonProps extends Omit<ButtonProps, "icon"> {
  text: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Подтверждение копирования уходит в общий ToastHost (base) через шину, а не в свой
 * antd-инстанс: эфемерные сообщения рисует один отрисовщик на весь продукт.
 */
export function CopyToClipboardButton({
  text,
  successMessage,
  errorMessage,
  title,
  onClick,
  ...restProps
}: CopyToClipboardButtonProps) {
  const { t } = useTranslation("common");

  const handleCopy: ButtonProps["onClick"] = (e) => {
    e?.stopPropagation?.();
    onClick?.(e);

    const value = String(text ?? "");
    navigator.clipboard
      .writeText(value)
      .then(() => {
        notify.message.success(successMessage ?? t("copy-to-clipboard-button.copied"));
      })
      .catch(() => {
        notify.message.error(errorMessage ?? t("copy-to-clipboard-button.error"));
      });
  };

  return (
    <BaseActionButton
      icon={<CopyOutlined />}
      title={title ?? t("copy-to-clipboard-button.copy")}
      onClick={handleCopy}
      {...restProps}
    />
  );
}
