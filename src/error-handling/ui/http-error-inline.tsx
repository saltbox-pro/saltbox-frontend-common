import {
  CloudServerOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  LockOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { AppError, AppErrorKind } from "../app-error";

import { ErrorDetails } from "./error-details";
import styles from "./http-error-inline.module.css";
import { resolveHttpErrorPresentation } from "./resolve-http-error-presentation";

type HttpErrorInlineProps = {
  error: AppError;
  onRetry?: () => void;
};

const iconByKind: Record<AppErrorKind, ReactNode> = {
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

const iconWrapClassByKind: Record<AppErrorKind, string> = {
  not_found: styles.iconWrapNotFound,
  forbidden: styles.iconWrapForbidden,
  unauthorized: styles.iconWrapForbidden,
  server: styles.iconWrapServer,
  unavailable: styles.iconWrapUnavailable,
  network: styles.iconWrapNetwork,
  conflict: styles.iconWrapForbidden,
  validation: styles.iconWrapForbidden,
  generic: styles.iconWrapGeneric,
};

export const HttpErrorInline = ({ error, onRetry }: HttpErrorInlineProps) => {
  const { t } = useTranslation("common");
  const presentation = resolveHttpErrorPresentation(error, t);

  return (
    <div className={styles.root} role="alert" aria-live="polite">
      <div className={`${styles.iconWrap} ${iconWrapClassByKind[presentation.kind]}`}>
        {iconByKind[presentation.kind]}
      </div>

      <div className={styles.body}>
        {presentation.statusLabel ? (
          <span className={styles.status}>{presentation.statusLabel}</span>
        ) : null}
        <h3 className={styles.title}>{presentation.title}</h3>
        <p className={styles.subtitle}>{presentation.subtitle}</p>
      </div>

      {onRetry ? (
        <div className={styles.actions}>
          <Button icon={<ReloadOutlined />} onClick={onRetry}>
            {t("errors.page.retry")}
          </Button>
        </div>
      ) : null}

      <ErrorDetails error={error} />
    </div>
  );
};
