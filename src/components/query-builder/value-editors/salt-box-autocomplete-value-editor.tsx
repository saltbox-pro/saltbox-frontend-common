import { ComponentProps, useEffect, useState } from "react";
import { ValueEditorProps } from "react-querybuilder";
import { AutoComplete } from "antd";

type AutoCompleteProps = ComponentProps<typeof AutoComplete>;
type AutoCompleteOptions = AutoCompleteProps["options"];

type AntDValueEditorProps = ValueEditorProps & {
  extraProps?: AutoCompleteProps;
  onValueChange?: (callback: (newOptions: AutoCompleteOptions) => void) => void;
};

export const SaltBoxAutocompleteValueEditor = (props: AntDValueEditorProps) => {
  const [options, setOptions] = useState<AutoCompleteOptions>([]);

  useEffect(() => {
    props.onValueChange?.((newOptions) => {
      setOptions(newOptions);
    });
  }, [props.field, props.value]);

  return (
    <AutoComplete
      options={options}
      value={props.value}
      title={props.title}
      className={props.className}
      disabled={props.disabled}
      onChange={props.handleOnChange}
      {...props.extraProps}
      style={{ width: "100%" }}
    />
  );
};
