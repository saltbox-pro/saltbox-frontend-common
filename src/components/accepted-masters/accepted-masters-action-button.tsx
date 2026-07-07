import { Button, type ButtonProps } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAcceptedMastersWarningMessage } from "./use-accepted-masters-warning-message";

export type AcceptedMastersActionButtonProps = Omit<ButtonProps, "onClick" | "loading"> & {
  onAction: () => void | Promise<void>;
  checkHasAcceptedMasters: () => Promise<boolean>;
  warningActionText: string;
  errorMessage?: string;
  loading?: boolean;
  messageApi: MessageInstance;
  navigate: (to: string) => void;
};

export function AcceptedMastersActionButton({
  onAction,
  checkHasAcceptedMasters,
  warningActionText,
  errorMessage,
  disabled,
  loading = false,
  messageApi,
  navigate,
  ...buttonProps
}: AcceptedMastersActionButtonProps) {
  const { t } = useTranslation("common");
  const renderWarningMessage = useAcceptedMastersWarningMessage();
  const [isChecking, setIsChecking] = useState(false);
  const resolvedErrorMessage = errorMessage ?? t("accepted-masters.error-load-salt-masters");

  const handleClick = useCallback(() => {
    if (disabled || loading || isChecking) return;

    setIsChecking(true);
    checkHasAcceptedMasters()
      .then((hasMasters) => {
        if (!hasMasters) {
          messageApi.warning(renderWarningMessage({ action: warningActionText, navigate }));
          return;
        }
        return Promise.resolve(onAction());
      })
      .catch((error) => {
        console.error("Accepted masters check failed", error);
        messageApi.error(resolvedErrorMessage);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [
    checkHasAcceptedMasters,
    disabled,
    isChecking,
    loading,
    messageApi,
    navigate,
    onAction,
    renderWarningMessage,
    resolvedErrorMessage,
    warningActionText,
  ]);

  return (
    <Button
      {...buttonProps}
      disabled={disabled}
      loading={loading || isChecking}
      onClick={handleClick}
    />
  );
}
