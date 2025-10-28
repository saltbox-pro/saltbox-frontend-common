import { ComponentProps } from "react";
// import { useTranslation } from "react-i18next";
import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import styles from "./copy-to-clipboard-button.module.css";

type ButtonType = ComponentProps<typeof Button>["type"];

const t = (str: string) => str;

export function CopyToClipboardButton({
  text,
  type = "link",
}: {
  text: string;
  type?: ButtonType;
}) {
  // const { t } = useTranslation();
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
        title={t("base.copy-to-clipboard")}
        onClick={() => {
          messageApi.success(t("base.copied-to-clipboard"));
          navigator.clipboard.writeText(text);
        }}
      />
    </>
  );
}
