import { AutoComplete, Input } from "antd";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { useInNotInPasteHandler } from "./utils/use-in-not-in-paste-handler";

type AutoCompleteProps = ComponentProps<typeof AutoComplete>;
type AutoCompleteOptions = AutoCompleteProps["options"];

type AntDValueEditorProps = ValueEditorProps & {
  extraProps?: AutoCompleteProps;
  onValueChange?: (callback: (newOptions: AutoCompleteOptions) => void) => void;
};

export const SaltBoxAutocompleteValueEditor = (props: AntDValueEditorProps) => {
  const [options, setOptions] = useState<AutoCompleteOptions>([]);
  const inNotInOnPaste = useInNotInPasteHandler(props.operator, props.handleOnChange);
  const onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      inNotInOnPaste(event);
    },
    [inNotInOnPaste]
  );

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
    >
      <Input onPaste={onPaste} />
    </AutoComplete>
  );
};
