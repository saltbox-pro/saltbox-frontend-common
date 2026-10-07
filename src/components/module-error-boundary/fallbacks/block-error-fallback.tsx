import { CloseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Popover, Result } from "antd";
import type { ReactNode } from "react";

import { tCommon, useCommonLocale } from "../../../i18n/common";
import { BaseActionButton } from "../../buttons/base-action-button";

import styles from "./block-error-fallback.module.css";
import { ErrorDetailsToggle } from "./error-details-toggle";
import subtitleStyles from "./fallback-subtitle.module.css";

export type BlockErrorFallbackVariant = "default" | "button" | "compact";

type BlockErrorFallbackProps = {
  variant?: BlockErrorFallbackVariant;
  title?: string;
  description?: string;
  error?: unknown;
  actions?: ReactNode;
  onRetry?: () => void;
  showErrorDetails?: boolean;
};

export function BlockErrorFallback({
  variant = "default",
  title,
  description,
  error,
  actions,
  onRetry,
  showErrorDetails,
}: BlockErrorFallbackProps) {
  const lang = useCommonLocale();
  const resolvedTitle = title ?? tCommon("error-boundary.block.title-default", undefined, lang);
  const resolvedDescription =
    description === undefined
      ? tCommon("error-boundary.block.description-default", undefined, lang)
      : description || undefined;
  const retryLabel = tCommon("error-boundary.actions.retry", undefined, lang);

  if (variant === "compact") {
    return (
      <Alert
        showIcon
        type="error"
        className={styles.compact}
        message={
          <span className={styles.compactRow}>
            <span className={styles.compactMessage}>{resolvedTitle}</span>
            <span className={styles.compactDetails}>
              <ErrorDetailsToggle error={error} align="start" showErrorDetails={showErrorDetails} />
            </span>
          </span>
        }
        action={
          !!(onRetry || actions) && (
            <>
              {!!onRetry && (
                <BaseActionButton
                  icon={<ReloadOutlined />}
                  title={retryLabel}
                  onClick={onRetry}
                  variant="text"
                />
              )}
              {actions}
            </>
          )
        }
      />
    );
  }

  const extra = [
    !!onRetry && (
      <Button key="retry" onClick={onRetry}>
        {retryLabel}
      </Button>
    ),
    actions,
  ].filter(Boolean);

  const content = (
    <Result
      className={styles.result}
      status="error"
      title={resolvedTitle}
      subTitle={
        <>
          {resolvedDescription ? (
            <span className={subtitleStyles.subtitle}>{resolvedDescription}</span>
          ) : null}
          <ErrorDetailsToggle error={error} showErrorDetails={showErrorDetails} />
        </>
      }
      extra={extra.length > 0 ? extra : undefined}
    />
  );

  if (variant === "button") {
    return (
      <Popover
        content={<div className={styles.buttonPopoverContent}>{content}</div>}
        trigger={["hover", "focus"]}
        classNames={{ root: styles.buttonPopoverOverlay }}
      >
        <Button danger icon={<CloseCircleOutlined />} role="alert">
          {tCommon("error-boundary.block.error-short", undefined, lang)}
        </Button>
      </Popover>
    );
  }

  return <div className={styles.default}>{content}</div>;
}
