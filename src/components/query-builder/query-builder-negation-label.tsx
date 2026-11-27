import { useTranslation } from "react-i18next";
import type { NotToggleProps } from "react-querybuilder";

export const QueryBuilderNegationLabel = ({ checked }: NotToggleProps) => {
  const { t } = useTranslation("common");
  return checked && <strong>{t("query-builder.not")}</strong>;
};
