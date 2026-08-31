import { useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";

const MASTERS_PATH = "/core/masters";

type RenderAcceptedMastersWarningParams = {
  action?: string;
  navigate: (to: string) => void;
};

export function useAcceptedMastersWarningMessage() {
  const { t } = useTranslation("common");

  return useCallback(
    ({ action, navigate }: RenderAcceptedMastersWarningParams) => (
      <Trans
        i18nKey={
          action != null && action !== ""
            ? "accepted-masters.warning-template"
            : "accepted-masters.warning-template-default"
        }
        ns="common"
        values={{ action }}
        components={{
          mastersLink: (
            <a
              href={MASTERS_PATH}
              aria-label={t("accepted-masters.masters-link-aria-label")}
              onClick={(e) => {
                e.preventDefault();
                navigate(MASTERS_PATH);
              }}
            />
          ),
        }}
      />
    ),
    [t]
  );
}
