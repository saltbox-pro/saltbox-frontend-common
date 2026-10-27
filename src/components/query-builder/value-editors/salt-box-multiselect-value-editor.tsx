import { Select } from "antd";
import { useEffect } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { parseCommaSeparatedListValue } from "saltbox-common/utils/normalize-list-input-value";

type SelectOption = { label?: string; value: string };

export const SaltBoxMultiselectValueEditor = ({
  value,
  handleOnChange,
  title,
  className,
  fieldData,
  operator,
}: ValueEditorProps) => {
  const selectedValues = parseCommaSeparatedListValue(value);
  const options = (fieldData?.selectOptions ?? []) as SelectOption[];
  const isMultiple = operator === "in" || operator === "notIn";
  const firstValue = selectedValues[0];

  useEffect(() => {
    if (!isMultiple && selectedValues.length > 1 && firstValue) {
      handleOnChange(firstValue);
    }
  }, [firstValue, handleOnChange, isMultiple, selectedValues.length]);

  return (
    <Select
      mode={isMultiple ? "multiple" : undefined}
      showSearch
      optionFilterProp="label"
      options={options}
      fieldNames={fieldData?.selectFieldNames}
      value={isMultiple ? selectedValues : firstValue}
      allowClear={true}
      onChange={(newValue: string | string[] | null) => {
        handleOnChange(Array.isArray(newValue) ? newValue.join(",") : (newValue ?? ""));
      }}
      className={className}
      title={title}
      style={{ width: "100%" }}
      styles={{
        popup: {
          root: {
            minWidth: 450,
            maxWidth: 550,
          },
        },
      }}
    />
  );
};
