import { CopyOutlined } from "@ant-design/icons";
import { type ButtonProps, message } from "antd";
import { useTranslation } from "react-i18next";

import { BaseActionButton } from "../../base-action-button";

interface CopyToClipboardButtonProps extends Omit<ButtonProps, "icon"> {
  text: string;
  successMessage?: string;
  errorMessage?: string;
  onCopySuccess?: (text: string) => void;
  onCopyError?: () => void;
}

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
  const [messageApi, contextHolder] = message.useMessage();
  const needsBuiltInToast = onCopySuccess == null || onCopyError == null;

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
        messageApi.success(successMessage ?? t("copy-to-clipboard-button.copied"));
      })
      .catch(() => {
        if (onCopyError != null) {
          onCopyError();
          return;
        }
        messageApi.error(errorMessage ?? t("copy-to-clipboard-button.error"));
      });
  };

  return (
    <>
      {needsBuiltInToast && contextHolder}
      <BaseActionButton
        icon={<CopyOutlined />}
        title={title ?? t("copy-to-clipboard-button.copy")}
        onClick={handleCopy}
        {...restProps}
      />
    </>
  );
}
