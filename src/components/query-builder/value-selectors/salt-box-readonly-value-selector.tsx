import { useTranslation } from "react-i18next";
import { ValueSelectorProps } from "react-querybuilder";

export const SaltBoxReadonlyValueSelector = (props: ValueSelectorProps) => {
  const { t } = useTranslation("common");
  // @ts-ignore
  const selected = props.options?.find((opt) => opt.value === props.value);

  if (!selected && typeof props.value === "string" && props.value.startsWith("grains.")) {
    const grainName = props.value.replace("grains.", "");
    return (
      <span>
        {t("query-builder.custom-grain")}: <span style={{ fontWeight: 700 }}>{grainName}</span>
      </span>
    );
  }

  return <span>{selected ? selected.label : String(props.value)}</span>;
};
