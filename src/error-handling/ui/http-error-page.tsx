import { Flex, Result } from "antd";
import { useTranslation } from "react-i18next";

import type { AppError } from "../app-error";

import { ErrorDetails } from "./error-details";
import { HttpErrorContent } from "./http-error-content";
import { resolveHttpErrorPresentation } from "./resolve-http-error-presentation";

type HttpErrorPageProps = {
  error: AppError;
  homePath?: string;
  onRetry?: () => void;
};

export const HttpErrorPage = ({ error, homePath, onRetry }: HttpErrorPageProps) => {
  const { t } = useTranslation("common");
  const presentation = resolveHttpErrorPresentation(error, t);

  const handleNavigateHome = homePath ? () => window.location.assign(homePath) : undefined;

  return (
    <Flex
      align="center"
      justify="center"
      style={{ width: "100%", height: "100vh", minHeight: 240, padding: 24 }}
    >
      <Result
        status={presentation.resultStatus}
        // код и его расшифровка вместе: «404 · Не найдено», а не голое «404»
        title={presentation.codeLine}
        subTitle={presentation.subtitle}
        extra={
          <HttpErrorContent
            onRetry={onRetry}
            onNavigateHome={handleNavigateHome}
            extra={<ErrorDetails error={error} />}
          />
        }
      />
    </Flex>
  );
};
