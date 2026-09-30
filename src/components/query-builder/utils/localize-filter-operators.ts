import type { TFunction } from "i18next";
import type { Option, OptionList } from "react-querybuilder";

type FilterField = Option & { operators?: Option[] };

export function localizeOperators(operators: readonly Option[], t: TFunction): Option[] {
  return operators.map((operator) => ({
    ...operator,
    label: t(`query-builder.operators.${operator.name}`, { defaultValue: operator.label }),
  }));
}

export function localizeFieldOperators(fields: OptionList, t: TFunction): OptionList {
  return (fields as FilterField[]).map((field) =>
    field.operators ? { ...field, operators: localizeOperators(field.operators, t) } : field
  );
}
