import type { MessageInstance } from "antd/es/message/interface";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { notifyApiError } from "../../../error-handling";
import type { WithAcceptedMastersCheckCallParams } from "../types";

import { useAcceptedMastersWarningMessage } from "./use-accepted-masters-warning-message";

export function useWithAcceptedMastersCheck(messageApi: MessageInstance) {
  const { t } = useTranslation("common");
  const renderWarningMessage = useAcceptedMastersWarningMessage();

  return useCallback(
    async (params: WithAcceptedMastersCheckCallParams): Promise<void> => {
      let hasMasters: boolean;
      try {
        hasMasters = await params.checkHasAcceptedMasters();
      } catch (error) {
        await notifyApiError(
          error,
          params.errorMessage ?? t("accepted-masters.error-check-failed")
        );
        return;
      }

      if (!hasMasters) {
        messageApi.warning(
          renderWarningMessage({
            action: params.warningActionText,
            navigate: params.navigate,
          })
        );
        return;
      }

      await params.onSuccess();
    },
    [messageApi, renderWarningMessage, t]
  );
}
