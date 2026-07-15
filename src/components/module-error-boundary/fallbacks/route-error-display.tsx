import { Button, Flex, Result } from "antd";
import { useTranslation } from "react-i18next";

import { ErrorDetailsToggle } from "./error-details-toggle";
import styles from "./fallback-subtitle.module.css";

type RouteErrorDisplayProps = {
  homePath?: string;
  error: unknown;
  onRetry?: () => void;
  onNavigateHome?: () => void;
};

export function RouteErrorDisplay({
  homePath,
  error,
  onRetry,
  onNavigateHome,
}: RouteErrorDisplayProps) {
  const { t } = useTranslation("common");

  return (
    <Flex align="center" justify="center" style={{ height: "100%", minHeight: 240, padding: 24 }}>
      <Result
        status="error"
        title={t("error-boundary.route.title")}
        subTitle={
          <>
            <span className={styles.subtitle}>{t("error-boundary.route.unknown-error")}</span>
            <ErrorDetailsToggle error={error} label={t("error-boundary.actions.details")} />
          </>
        }
        extra={[
          !!onRetry && (
            <Button key="retry" onClick={onRetry}>
              {t("error-boundary.actions.retry")}
            </Button>
          ),
          !!homePath && (
            <Button
              key="home"
              type="primary"
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                  return;
                }
                window.location.assign(homePath);
              }}
            >
              {t("error-boundary.actions.home")}
            </Button>
          ),
        ]}
      />
    </Flex>
  );
}
