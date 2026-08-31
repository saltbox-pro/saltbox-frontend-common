import { useTranslation } from "react-i18next";

export function useAcceptedMastersErrorMessage(): string {
  const { t } = useTranslation("common");
  return t("accepted-masters.error-load-salt-masters");
}
