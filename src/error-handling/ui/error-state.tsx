import {
  CloudServerOutlined,
  CopyOutlined,
  DisconnectOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  HomeOutlined,
  LockOutlined,
  ReloadOutlined,
  UpOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { AppError, AppErrorKind } from "../app-error";

import { ErrorDetailsPanel, useErrorDebugCopy } from "./error-details-panel";
import styles from "./error-state.module.css";
import { resolveHttpErrorPresentation } from "./resolve-http-error-presentation";

const ICON_BY_KIND: Record<AppErrorKind, ReactNode> = {
  not_found: <FileSearchOutlined />,
  forbidden: <LockOutlined />,
  unauthorized: <LockOutlined />,
  server: <CloudServerOutlined />,
  unavailable: <CloudServerOutlined />,
  network: <DisconnectOutlined />,
  conflict: <WarningOutlined />,
  validation: <WarningOutlined />,
  generic: <ExclamationCircleOutlined />,
};

const ICON_CLASS_BY_KIND: Record<AppErrorKind, string> = {
  not_found: styles.iconNotFound,
  forbidden: styles.iconForbidden,
  unauthorized: styles.iconForbidden,
  server: styles.iconServer,
  unavailable: styles.iconServer,
  network: styles.iconNetwork,
  conflict: styles.iconForbidden,
  validation: styles.iconForbidden,
  generic: styles.iconGeneric,
};

export interface ErrorStateProps {
  error: AppError;
  /** block — виджет/таблица/drawer; page — детальный роут (крупнее + «на главную») */
  variant?: "block" | "page";
  onRetry?: () => void;
  onNavigateHome?: () => void;
}

/**
 * Единое представление ошибки загрузки для всех уровней: страница и блок отличаются
 * только масштабом, разметка одна.
 *
 * Высота корня фиксирована при любом состоянии: детали не раздвигают блок, а занимают
 * место основного содержимого и скроллятся внутри себя. Поэтому «Показать детали»
 * не двигает ни сам блок, ни окружающий контент.
 */
export const ErrorState = ({
  error,
  variant = "block",
  onRetry,
  onNavigateHome,
}: ErrorStateProps) => {
  const { t } = useTranslation("common");
  const [expanded, setExpanded] = useState(false);
  const copyDebug = useErrorDebugCopy(error);

  const presentation = resolveHttpErrorPresentation(error, t);
  const diagnostics = error.diagnostics;

  return (
    <div
      className={`${styles.root} ${variant === "page" ? styles.page : styles.block}`}
      role="alert"
      aria-live="polite"
    >
      {diagnostics && expanded ? (
        <div className={styles.detailsView}>
          <Flex align="center" justify="space-between" gap={8} className={styles.detailsHeader}>
            <span className={styles.detailsTitle}>{presentation.codeLine}</span>
            <Flex gap={4}>
              <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyDebug}>
                {t("errors.copy-debug")}
              </Button>
              <Button
                type="link"
                size="small"
                icon={<UpOutlined />}
                onClick={() => setExpanded(false)}
              >
                {t("errors.hide-details")}
              </Button>
            </Flex>
          </Flex>
          <div className={styles.detailsBody}>
            <ErrorDetailsPanel diagnostics={diagnostics} />
          </div>
        </div>
      ) : (
        <div className={styles.main}>
          <div className={`${styles.icon} ${ICON_CLASS_BY_KIND[presentation.kind]}`}>
            {ICON_BY_KIND[presentation.kind]}
          </div>

          <div className={styles.body}>
            {/* бейдж с кодом над заголовком, ниже — расшифровка вида ошибки */}
            {presentation.statusLabel ? (
              <span className={styles.status}>{presentation.statusLabel}</span>
            ) : null}
            <h3 className={styles.title}>{presentation.title}</h3>
            <p className={styles.subtitle}>{presentation.subtitle}</p>
          </div>

          <Flex gap={8} wrap justify="center">
            {onRetry ? (
              <Button icon={<ReloadOutlined />} onClick={onRetry}>
                {t("errors.page.retry")}
              </Button>
            ) : null}
            {onNavigateHome ? (
              <Button type="primary" icon={<HomeOutlined />} onClick={onNavigateHome}>
                {t("errors.page.back-home")}
              </Button>
            ) : null}
          </Flex>

          {diagnostics ? (
            <Flex gap={4} wrap justify="center">
              <Button
                type="link"
                size="small"
                icon={<DownOutlined />}
                onClick={() => setExpanded(true)}
              >
                {t("errors.show-details")}
              </Button>
              <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyDebug}>
                {t("errors.copy-debug")}
              </Button>
            </Flex>
          ) : null}
        </div>
      )}
    </div>
  );
};
