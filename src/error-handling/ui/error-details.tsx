import { CopyOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AppError } from "../app-error";

import { ErrorDetailsPanel, useErrorDebugCopy } from "./error-details-panel";
import styles from "./error-details.module.css";

/**
 * Раскрывашка диагностики для поверхностей, которые могут расти по высоте
 * (alert в модалке). У блочных и страничных состояний своя разметка с фиксированным
 * слотом — см. ErrorState.
 */
export const ErrorDetails = ({ error }: { error: AppError }) => {
  const { t } = useTranslation("common");
  const [expanded, setExpanded] = useState(false);
  const copyDebug = useErrorDebugCopy(error);
  const diagnostics = error.diagnostics;

  if (!diagnostics) return null;

  return (
    <div className={styles.root}>
      <Flex gap={4} wrap>
        <Button
          type="link"
          size="small"
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? t("errors.hide-details") : t("errors.show-details")}
        </Button>
        <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyDebug}>
          {t("errors.copy-debug")}
        </Button>
      </Flex>

      {expanded ? (
        <div className={styles.slot}>
          <ErrorDetailsPanel diagnostics={diagnostics} />
        </div>
      ) : null}
    </div>
  );
};
