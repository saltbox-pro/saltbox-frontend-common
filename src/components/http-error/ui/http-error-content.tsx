import { Button, Flex } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type HttpErrorContentProps = {
  onRetry?: () => void;
  onNavigateHome?: () => void;
  homeLabel?: string;
  extra?: ReactNode;
};

export const HttpErrorContent = ({
  onRetry,
  onNavigateHome,
  homeLabel,
  extra,
}: HttpErrorContentProps) => {
  const { t } = useTranslation("common");

  return (
    <Flex vertical align="center" gap={8}>
      <Flex gap={8}>
        {onRetry && <Button onClick={onRetry}>{t("errors.page.retry")}</Button>}
        {onNavigateHome && (
          <Button type="primary" onClick={onNavigateHome}>
            {homeLabel ?? t("errors.page.back-home")}
          </Button>
        )}
      </Flex>
      {extra}
    </Flex>
  );
};
