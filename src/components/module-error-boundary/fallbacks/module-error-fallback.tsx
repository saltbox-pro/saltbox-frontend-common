import { Button, Flex, Result } from "antd";

import { tCommon, useCommonLocale } from "../utils/i18n";

import { ErrorDetailsToggle } from "./error-details-toggle";
import styles from "./fallback-subtitle.module.css";

type ModuleErrorFallbackProps = {
  moduleName: string;
  error?: unknown;
};

export function ModuleErrorFallback({ moduleName, error }: ModuleErrorFallbackProps) {
  const lang = useCommonLocale();

  return (
    <Flex align="center" justify="center" style={{ height: "100%", minHeight: 240, padding: 24 }}>
      <Result
        status="error"
        title={tCommon("error-boundary.module.title", { moduleName }, lang)}
        subTitle={
          <>
            <span className={styles.subtitle}>
              {tCommon("error-boundary.module.subtitle-default", undefined, lang)}
            </span>
            <ErrorDetailsToggle error={error} />
          </>
        }
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            {tCommon("error-boundary.actions.reload", undefined, lang)}
          </Button>
        }
      />
    </Flex>
  );
}
