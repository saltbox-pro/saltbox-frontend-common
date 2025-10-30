import { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import styles from "./copy-to-clipboard-button.module.css";

type ButtonType = ComponentProps<typeof Button>["type"];

export function CopyToClipboardButton({
  text,
  type = "link",
}: {
  text: string;
  type?: ButtonType;
}) {
  const { t } = useTranslation("common");
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <Button
        className={styles.buttonCopyToClipboard}
        icon={<CopyOutlined />}
        type={type}
        shape="circle"
        size="small"
        title={t("copy-to-clipboard-button.copy")}
        onClick={() => {
          messageApi.success(t("copy-to-clipboard-button.copied"));
          navigator.clipboard.writeText(text);
        }}
      />
    </>
  );
}
