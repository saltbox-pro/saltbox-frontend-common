import { Select } from "antd";
import { useMemo } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { parseListValue } from "./utils/parse-list-value";

type SelectOption = { label?: string; value: string };

export const SaltBoxMultiselectValueEditor = ({
  value,
  handleOnChange,
  title,
  className,
  fieldData,
}: ValueEditorProps) => {
  const selectedValues = useMemo(() => parseListValue(value), [value]);
  const options = (fieldData?.selectOptions ?? []) as SelectOption[];

  const handleChange = (newValues: string[]) => {
    handleOnChange(newValues.join(","));
  };

  return (
    <Select
      mode="multiple"
      showSearch
      optionFilterProp="label"
      options={options}
      fieldNames={fieldData?.selectFieldNames}
      value={selectedValues}
      allowClear={true}
      onChange={handleChange}
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
