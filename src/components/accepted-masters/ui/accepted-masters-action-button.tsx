import { Button, type ButtonProps } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";

import { useWithAcceptedMastersCheck } from "../hooks/use-with-accepted-masters-check";

export type AcceptedMastersActionButtonProps = Omit<ButtonProps, "onClick" | "loading"> & {
  onAction: () => void | Promise<void>;
  checkHasAcceptedMasters: () => Promise<boolean>;
  warningActionText?: string;
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
  const withAcceptedMastersCheck = useWithAcceptedMastersCheck(messageApi);
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || loading || isChecking) return;

    setIsChecking(true);
    withAcceptedMastersCheck({
      checkHasAcceptedMasters,
      navigate,
      onSuccess: onAction,
      errorMessage,
      warningActionText,
    }).finally(() => {
      setIsChecking(false);
    });
  }, [
    checkHasAcceptedMasters,
    disabled,
    errorMessage,
    isChecking,
    loading,
    navigate,
    onAction,
    withAcceptedMastersCheck,
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
