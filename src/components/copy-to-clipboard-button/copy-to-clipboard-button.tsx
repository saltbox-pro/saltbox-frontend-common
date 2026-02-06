import { CopyOutlined } from "@ant-design/icons";
import { Button, type ButtonProps, message } from "antd";
import { useTranslation } from "react-i18next";

interface CopyToClipboardButtonProps extends ButtonProps {
  text: string;
}

export function CopyToClipboardButton({ text, onClick, ...restProps }: CopyToClipboardButtonProps) {
  const { t } = useTranslation("common");
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy: ButtonProps["onClick"] = (e) => {
    e.stopPropagation();
    onClick?.(e);

    const value = String(text ?? "");
    navigator.clipboard
      .writeText(value)
      .then(() => {
        messageApi.success(t("copy-to-clipboard-button.copied"));
      })
      .catch(() => {
        messageApi.error(t("copy-to-clipboard-button.error"));
      });
  };

  return (
    <>
      {contextHolder}
      <Button
        icon={<CopyOutlined />}
        color="default"
        variant="outlined"
        size="small"
        title={t("copy-to-clipboard-button.copy")}
        onClick={handleCopy}
        {...restProps}
      />
    </>
  );
}
