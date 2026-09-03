import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

import { CopyToClipboardButton } from "saltbox-common/components/buttons/copy-to-clipboard-button";

import { getErrorDetails } from "../utils/get-error-message";
import { tCommon, useCommonLocale } from "../utils/i18n";

import styles from "./error-details-toggle.module.css";

type ErrorDetailsToggleProps = {
  error?: unknown;
  label?: string;
  align?: "center" | "start";
  iconOnly?: boolean;
  showErrorDetails?: boolean;
};

export function ErrorDetailsToggle({
  error,
  label,
  align = "center",
  iconOnly = false,
  showErrorDetails,
}: ErrorDetailsToggleProps) {
  const lang = useCommonLocale();
  const details =
    showErrorDetails === false
      ? undefined
      : getErrorDetails(error, { showInProduction: showErrorDetails === true });

  if (!details) {
    return null;
  }

  const resolvedLabel = label ?? tCommon("error-boundary.actions.details", undefined, lang);

  return (
    <div
      className={`${styles.root} ${align === "start" ? styles.alignStart : ""} ${
        iconOnly ? styles.iconOnly : ""
      }`}
    >
      <Tooltip
        trigger={["click"]}
        classNames={{ root: styles.tooltip }}
        title={
          <div className={styles.tooltipContent}>
            <span className={styles.detailsText}>{details}</span>
            <CopyToClipboardButton
              text={details}
              size="small"
              title={tCommon("error-boundary.actions.copy", undefined, lang)}
              successMessage={tCommon("error-boundary.actions.copied", undefined, lang)}
              errorMessage={tCommon("error-boundary.actions.copy-failed", undefined, lang)}
            />
          </div>
        }
      >
        <span className={styles.trigger} aria-label={resolvedLabel} title={resolvedLabel}>
          <InfoCircleOutlined />
          {iconOnly ? null : <span>{resolvedLabel}</span>}
        </span>
      </Tooltip>
    </div>
  );
}
