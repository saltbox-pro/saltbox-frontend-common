import { CopyOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Flex, message, theme, Typography } from "antd";
import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { AppError, buildErrorDebugText } from "../app-error";

import styles from "./error-details.module.css";

const { Text } = Typography;

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString();
};

/**
 * Раскрывашка транспортной диагностики + копирование debug-инфы. Показывается везде,
 * где рисуется ошибка (зона, страница, alert в модалке), если middleware приложил
 * diagnostics. Раньше эта информация существовала только в глобальной нотификации base.
 */
export const ErrorDetails = ({ error }: { error: AppError }) => {
  const { t } = useTranslation("common");
  const { token } = theme.useToken();
  const [expanded, setExpanded] = useState(false);
  const diagnostics = error.diagnostics;

  if (!diagnostics) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildErrorDebugText(error));
      message.success({ content: t("errors.debug-copied"), duration: 2 });
    } catch {
      message.error({ content: t("errors.debug-copy-failed"), duration: 3 });
    }
  };

  return (
    <div
      className={styles.root}
      style={
        {
          "--text-secondary": token.colorTextSecondary,
          "--fill": token.colorFillAlter,
          "--border": token.colorBorderSecondary,
        } as CSSProperties
      }
    >
      <Flex gap={8} justify="center" wrap>
        <Button
          type="link"
          size="small"
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? t("errors.hide-details") : t("errors.show-details")}
        </Button>
        <Button type="link" size="small" icon={<CopyOutlined />} onClick={handleCopy}>
          {t("errors.copy-debug")}
        </Button>
      </Flex>

      {expanded ? (
        <div className={styles.meta}>
          <dl className={styles.metaList}>
            <dt>{t("errors.detail-url")}</dt>
            <dd className={styles.url}>{diagnostics.url}</dd>
            <dt>{t("errors.detail-status")}</dt>
            <dd>
              {diagnostics.status}
              {diagnostics.statusText ? ` ${diagnostics.statusText}` : ""}
            </dd>
            <dt>{t("errors.detail-time")}</dt>
            <dd>{formatTime(diagnostics.timestamp)}</dd>
          </dl>
          {diagnostics.responseBody ? (
            <div className={styles.bodyBlock}>
              <Text type="secondary">{t("errors.detail-response-body")}</Text>
              <pre className={styles.pre}>{diagnostics.responseBody}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
