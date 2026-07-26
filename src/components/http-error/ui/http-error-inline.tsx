import {
  CloudServerOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  LockOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { HttpErrorKind, ResourceLoadError } from "../types/resource-load-error";
import { resolveHttpErrorPresentation } from "../utils/resolve-http-error-presentation";

import styles from "./http-error-inline.module.css";

type HttpErrorInlineProps = {
  error: ResourceLoadError;
  onRetry?: () => void;
};

const iconByKind: Record<HttpErrorKind, ReactNode> = {
  not_found: <FileSearchOutlined />,
  forbidden: <LockOutlined />,
  server: <CloudServerOutlined />,
  unavailable: <CloudServerOutlined />,
  network: <DisconnectOutlined />,
  generic: <ExclamationCircleOutlined />,
};

const iconWrapClassByKind: Record<HttpErrorKind, string> = {
  not_found: styles.iconWrapNotFound,
  forbidden: styles.iconWrapForbidden,
  server: styles.iconWrapServer,
  unavailable: styles.iconWrapUnavailable,
  network: styles.iconWrapNetwork,
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
    </div>
  );
};
