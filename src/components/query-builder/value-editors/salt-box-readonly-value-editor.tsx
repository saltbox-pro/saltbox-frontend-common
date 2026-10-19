import { ValueEditorProps } from "react-querybuilder";

import { parseCommaSeparatedListValue } from "saltbox-common/utils/normalize-list-input-value";

type SelectFieldNames = { label?: string; value?: string };

const LIST_OPERATORS = new Set(["in", "notin"]);

function formatValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function buildLabelByValue(
  options: unknown,
  fieldNames: SelectFieldNames | undefined
): Map<string, string> | null {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  const labelKey = fieldNames?.label ?? "label";
  const valueKey = fieldNames?.value ?? "value";
  const labelByValue = new Map<string, string>();

  for (const option of options) {
    if (!option || typeof option !== "object") {
      continue;
    }

    const record = option as Record<string, unknown>;
    const optionValue = record[valueKey];
    const optionLabel = record[labelKey];
    if (optionValue === undefined || optionValue === null) {
      continue;
    }

    labelByValue.set(
      String(optionValue),
      optionLabel === undefined || optionLabel === null ? String(optionValue) : String(optionLabel)
    );
  }

  return labelByValue;
}

export const SaltBoxReadonlyValueEditor = (props: ValueEditorProps) => {
  const labelByValue = buildLabelByValue(
    props.fieldData?.selectOptions,
    props.fieldData?.selectFieldNames as SelectFieldNames | undefined
  );

  if (!labelByValue) {
    return <span>{formatValue(props.value)}</span>;
  }

  const isList = Array.isArray(props.value) || LIST_OPERATORS.has(props.operator.toLowerCase());
  const values = isList ? parseCommaSeparatedListValue(props.value) : [formatValue(props.value)];

  return <span>{values.map((value) => labelByValue.get(value) ?? value).join(", ")}</span>;
};
