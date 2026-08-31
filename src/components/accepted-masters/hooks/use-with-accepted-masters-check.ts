import type { MessageInstance } from "antd/es/message/interface";
import { useCallback } from "react";

import type { WithAcceptedMastersCheckCallParams } from "../types";

import { useAcceptedMastersErrorMessage } from "./use-accepted-masters-error-message";
import { useAcceptedMastersWarningMessage } from "./use-accepted-masters-warning-message";

export function useWithAcceptedMastersCheck(messageApi: MessageInstance) {
  const acceptedMastersErrorMessage = useAcceptedMastersErrorMessage();
  const renderWarningMessage = useAcceptedMastersWarningMessage();

  return useCallback(
    async (params: WithAcceptedMastersCheckCallParams): Promise<void> => {
      try {
        const hasMasters = await params.checkHasAcceptedMasters();
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
      } catch (error) {
        console.error("Accepted masters check failed", error);
        messageApi.error(params.errorMessage ?? acceptedMastersErrorMessage);
      }
    },
    [acceptedMastersErrorMessage, messageApi, renderWarningMessage]
  );
}
