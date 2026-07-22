import { Alert, Button, Flex } from "antd";
import { useTranslation } from "react-i18next";

import type { ResourceLoadError } from "../types/resource-load-error";
import { resolveHttpErrorPresentation } from "../utils/resolve-http-error-presentation";

type HttpErrorInlineProps = {
  error: ResourceLoadError;
  onRetry?: () => void;
  showStatusInMessage?: boolean;
};

export const HttpErrorInline = ({
  error,
  onRetry,
  showStatusInMessage = true,
}: HttpErrorInlineProps) => {
  const { t } = useTranslation("common");
  const presentation = resolveHttpErrorPresentation(error, t);

  const message =
    showStatusInMessage && presentation.showStatusInTitle
      ? `${presentation.title} - ${presentation.subtitle}`
      : presentation.subtitle;

  return (
    <Flex vertical gap={8}>
      <Alert type="error" showIcon message={message} />
      {onRetry && (
        <Button type="primary" onClick={onRetry}>
          {t("errors.page.retry")}
        </Button>
      )}
    </Flex>
  );
};
