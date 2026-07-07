import type { MessageInstance } from "antd/es/message/interface";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useAcceptedMastersWarningMessage } from "./use-accepted-masters-warning-message";

export type WithAcceptedMastersCheckCallParams = {
  checkHasAcceptedMasters: () => Promise<boolean>;
  onSuccess: () => void | Promise<void>;
  warningActionText: string;
  navigate: (to: string) => void;
  errorMessage?: string;
};

export function useAcceptedMastersErrorMessage(): string {
  const { t } = useTranslation("common");
  return t("accepted-masters.error-load-salt-masters");
}

export function useWithAcceptedMastersCheck(messageApi: MessageInstance) {
  const acceptedMastersErrorMessage = useAcceptedMastersErrorMessage();
  const renderWarningMessage = useAcceptedMastersWarningMessage();

  return useCallback(
    async (params: WithAcceptedMastersCheckCallParams): Promise<void> => {
      try {
        const hasMasters = await params.checkHasAcceptedMasters();
        if (!hasMasters) {
          messageApi.warning(
            renderWarningMessage({ action: params.warningActionText, navigate: params.navigate })
          );
          return;
        }

        await params.onSuccess();
      } catch (error) {
        console.error("Accepted masters check failed", error);
        messageApi.error(params.errorMessage ?? acceptedMastersErrorMessage);
      }
    },
    [acceptedMastersErrorMessage, messageApi, renderWarningMessage]
  );
}
