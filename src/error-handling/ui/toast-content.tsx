import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Flex, Typography, theme } from "antd";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { CopyToClipboardButton } from "../../components/buttons";

import styles from "./toast-content.module.css";

const { Text } = Typography;

type ToastContentProps = {
  /** «500 · Ошибка сервера» — уже собранная строка кода с расшифровкой */
  codeLine?: string;
  description?: string;
  debugText?: string;
  expanded: boolean;
  /** Разворачивает детали: тост при этом закрепляется, чтобы не исчез во время чтения */
  onExpand: () => void;
  onCollapse: () => void;
};

export const ToastContent = ({
  codeLine,
  description,
  debugText,
  expanded,
  onExpand,
  onCollapse,
}: ToastContentProps) => {
  const { t } = useTranslation("common");
  const { token } = theme.useToken();

  return (
    <div
      className={styles.root}
      style={{ "--toast-fill": token.colorFillQuaternary } as CSSProperties}
    >
      {codeLine ? (
        <Text type="secondary" className={styles.codeLine}>
          {codeLine}
        </Text>
      ) : null}

      {description ? <div className={styles.description}>{description}</div> : null}

      {debugText ? (
        <>
          <Flex gap={4} wrap>
            <Button
              type="link"
              size="small"
              className={styles.action}
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
              onClick={expanded ? onCollapse : onExpand}
            >
              {expanded ? t("errors.hide-details") : t("errors.show-details")}
            </Button>
            {/* общий компонент проекта: он же показывает сообщение об успехе копирования */}
            <CopyToClipboardButton
              text={debugText}
              type="link"
              variant="link"
              color="primary"
              size="small"
              className={styles.action}
            >
              {t("errors.copy-debug")}
            </CopyToClipboardButton>
          </Flex>

          {expanded ? <pre className={styles.pre}>{debugText}</pre> : null}
        </>
      ) : null}
    </div>
  );
};
