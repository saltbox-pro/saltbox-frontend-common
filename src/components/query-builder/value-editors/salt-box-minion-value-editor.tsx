import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, ComponentProps } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { FullWidthValueEditor } from "./full-width-value-editor";
import { SaltBoxAutocompleteValueEditor } from "./salt-box-autocomplete-value-editor";
import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";

type AutoCompleteProps = ComponentProps<typeof SaltBoxAutocompleteValueEditor>;

export const SaltBoxMinionValueEditor: FC<
  ValueEditorProps & { onValueChange: AutoCompleteProps["onValueChange"] }
> = ({ onValueChange, ...props }) => {
  const isDateTime = props?.inputType === "datetime-local";
  const isCheckbox = props.type === "checkbox";
  const isAutocomplete = props.fieldData.inputType === undefined;

  if (
    (isDateTime &&
      (props?.operator === "null" ||
        props?.operator === "notNull" ||
        props?.operator === "between" ||
        props?.operator === "notBetween")) ||
    (isAutocomplete && (props?.operator === "null" || props?.operator === "notNull"))
  ) {
    return <></>;
  }

  const editor = isDateTime ? (
    <SaltBoxDateTimeValueEditor {...props} />
  ) : isAutocomplete ? (
    <SaltBoxAutocompleteValueEditor onValueChange={onValueChange} {...props} />
  ) : (
    <AntDValueEditor {...props} />
  );

  if (isCheckbox) {
    return editor;
  }

  return <FullWidthValueEditor>{editor}</FullWidthValueEditor>;
};
