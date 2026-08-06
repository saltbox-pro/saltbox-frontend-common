import { message, theme, Typography } from "antd";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { AppError, buildErrorDebugText, type ErrorDiagnostics } from "../app-error";

import styles from "./error-details-panel.module.css";

const { Text } = Typography;

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString();
};

/** Копирование debug-текста — общий обработчик для всех поверхностей. */
export function useErrorDebugCopy(error: AppError): () => Promise<void> {
  const { t } = useTranslation("common");

  return async () => {
    try {
      await navigator.clipboard.writeText(buildErrorDebugText(error));
      message.success({ content: t("errors.debug-copied"), duration: 2 });
    } catch {
      message.error({ content: t("errors.debug-copy-failed"), duration: 3 });
    }
  };
}

/**
 * Панель транспортной диагностики. Своей высоты не навязывает — её задаёт слот,
 * в который панель вставлена, а внутреннее содержимое скроллится.
 */
export const ErrorDetailsPanel = ({ diagnostics }: { diagnostics: ErrorDiagnostics }) => {
  const { t } = useTranslation("common");
  const { token } = theme.useToken();

  return (
    <div
      className={styles.panel}
      style={
        {
          "--text-secondary": token.colorTextSecondary,
          "--fill": token.colorFillAlter,
          "--border": token.colorBorderSecondary,
        } as CSSProperties
      }
    >
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
  );
};
