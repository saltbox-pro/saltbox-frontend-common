import { useCallback } from "react";
import { Trans } from "react-i18next";

const MASTERS_PATH = "/core/masters";

type RenderAcceptedMastersWarningParams = {
  action: string;
  navigate: (to: string) => void;
};

export function useAcceptedMastersWarningMessage() {
  return useCallback(
    ({ action, navigate }: RenderAcceptedMastersWarningParams) => (
      <Trans
        i18nKey="accepted-masters.warning-template"
        ns="common"
        values={{ action }}
        components={{
          mastersLink: (
            <a
              href={MASTERS_PATH}
              aria-label="Masters"
              onClick={(e) => {
                e.preventDefault();
                navigate(MASTERS_PATH);
              }}
            />
          ),
        }}
      />
    ),
    []
  );
}
