import { Flex, Input, Select } from "antd";
import type { ComponentPropsWithoutRef } from "react";
import * as React from "react";
import { joinWith, useValueSelector, VersatileSelectorProps } from "react-querybuilder";

export type AntDValueSelectorProps = VersatileSelectorProps &
  Omit<ComponentPropsWithoutRef<typeof Select>, "onChange" | "defaultValue">;

export const SaltBoxMinionValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple,
  listsAsArrays,
  testID: _testID,
  rule: _rule,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  operator: _operator,
  field: _field,
  fieldData: _fieldData,
  schema: _schema,
  ...extraProps
}: AntDValueSelectorProps): React.JSX.Element => {
  const [isCustomValue, setIsCustomValue] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");

  const { onChange: onChangeNoArrays } = useValueSelector({
    handleOnChange,
    listsAsArrays: false,
    multiple: false,
    value,
  });
  const { onChange: onChangeNormal, val } = useValueSelector({
    handleOnChange,
    listsAsArrays: multiple || listsAsArrays,
    multiple,
    value,
  });

  const onChange = React.useCallback(
    (v: string | string[]) => {
      if (multiple && !listsAsArrays && Array.isArray(v)) {
        onChangeNoArrays(joinWith(v));
      } else {
        onChangeNormal(v);
      }
    },
    [listsAsArrays, multiple, onChangeNoArrays, onChangeNormal]
  );

  const dropdownStyle = { minWidth: 360 };
  const knownFieldValues = React.useMemo(
    () =>
      (options || [])
        .map((option) => {
          const typedOption = option as { value?: unknown; name?: unknown };
          if (typeof typedOption.value === "string") return typedOption.value;
          if (typeof typedOption.name === "string") return typedOption.name;
          return "";
        })
        .filter(Boolean),
    [options]
  );

  React.useEffect(() => {
    const selectedField = typeof val === "string" ? val : "";
    if (!selectedField) {
      setIsCustomValue(false);
      setCustomValue("");
      return;
    }

    const isKnownField = knownFieldValues.includes(selectedField);
    const isCustomField = selectedField.startsWith("grains.") && !isKnownField;
    if (!isCustomField) {
      setIsCustomValue(false);
      setCustomValue("");
      return;
    }

    setIsCustomValue(true);
    setCustomValue(selectedField.slice("grains.".length));
  }, [knownFieldValues, val]);

  if (className === "rule-fields") {
    return (
      <Flex gap={8}>
        <Select
          {...(multiple ? { mode: "multiple", allowClear: true } : {})}
          showSearch
          title={title}
          className={className}
          popupMatchSelectWidth={false}
          dropdownStyle={dropdownStyle}
          disabled={disabled}
          value={isCustomValue ? "custom" : val}
          onChange={(v) => {
            if (v === "custom") {
              setIsCustomValue(true);
              onChange("grains.");
            } else {
              setIsCustomValue(false);
              onChange(v);
            }
          }}
          optionFilterProp="label"
          options={[...(options || []), { label: "Custom grain", value: "custom" }]}
          {...extraProps}
        />
        {isCustomValue && (
          <Input
            value={customValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setCustomValue(newValue);
              onChange(`grains.${newValue}`);
            }}
            disabled={disabled}
            placeholder="Grain name"
          />
        )}
      </Flex>
    );
  }

  return (
    <Select
      {...(multiple ? { mode: "multiple", allowClear: true } : {})}
      showSearch
      title={title}
      className={className}
      popupMatchSelectWidth={false}
      dropdownStyle={dropdownStyle}
      disabled={disabled}
      value={val}
      onChange={onChange}
      optionFilterProp="label"
      options={options}
      {...extraProps}
    />
  );
};
