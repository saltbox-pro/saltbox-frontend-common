import { CopyOutlined } from "@ant-design/icons";
import { type ButtonProps } from "antd";
import { useTranslation } from "react-i18next";

import { notify } from "../../../../error-handling/notify";
import { BaseActionButton } from "../../base-action-button";

interface CopyToClipboardButtonProps extends Omit<ButtonProps, "icon"> {
  text: string;
  successMessage?: string;
  errorMessage?: string;
  onCopySuccess?: (text: string) => void;
  onCopyError?: () => void;
}

/**
 * Подтверждение копирования по умолчанию уходит в общий ToastHost (base) через шину,
 * а не в свой antd-инстанс: эфемерные сообщения рисует один отрисовщик на весь продукт.
 * Колбэки onCopySuccess/onCopyError перехватывают показ, если вызывающий хочет свой.
 */
export function CopyToClipboardButton({
  text,
  successMessage,
  errorMessage,
  onCopySuccess,
  onCopyError,
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
        if (onCopySuccess != null) {
          onCopySuccess(value);
          return;
        }
        notify.message.success(successMessage ?? t("copy-to-clipboard-button.copied"));
      })
      .catch(() => {
        if (onCopyError != null) {
          onCopyError();
          return;
        }
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
