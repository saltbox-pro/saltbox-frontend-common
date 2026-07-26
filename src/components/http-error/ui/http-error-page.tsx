import { Flex, Result } from "antd";
import { useTranslation } from "react-i18next";

import type { ResourceLoadError } from "../types/resource-load-error";
import { resolveHttpErrorPresentation } from "../utils/resolve-http-error-presentation";

import { HttpErrorContent } from "./http-error-content";

type HttpErrorPageProps = {
  error: ResourceLoadError;
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
        title={presentation.showStatusInTitle ? presentation.statusLabel : undefined}
        subTitle={presentation.subtitle}
        extra={<HttpErrorContent onRetry={onRetry} onNavigateHome={handleNavigateHome} />}
      />
    </Flex>
  );
};
