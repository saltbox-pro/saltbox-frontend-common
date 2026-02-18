import { Select } from "antd";
import { useMemo } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { parseListValue } from "./utils/parse-list-value";

export const SaltBoxMultiselectValueEditor = ({
  value,
  handleOnChange,
  title,
  className,
  fieldData,
}: ValueEditorProps) => {
  const selectedValues = useMemo(() => parseListValue(value), [value]);

  const handleChange = (newValues: string[]) => {
    handleOnChange(newValues.join(","));
  };

  return (
    <Select
      mode="multiple"
      options={fieldData?.selectOptions as any}
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
