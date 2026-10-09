import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, ComponentProps } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { FullWidthValueEditor } from "./full-width-value-editor";
import { SaltBoxAutocompleteValueEditor } from "./salt-box-autocomplete-value-editor";
import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";
import { useInNotInPasteHandler } from "./utils/use-in-not-in-paste-handler";

type AutoCompleteProps = ComponentProps<typeof SaltBoxAutocompleteValueEditor>;

const NON_TEXT_EDITOR_TYPES = new Set(["checkbox", "select", "multiselect", "radio", "switch"]);

export const SaltBoxMinionValueEditor: FC<
  ValueEditorProps & { onValueChange: AutoCompleteProps["onValueChange"] }
> = ({ onValueChange, ...props }) => {
  const isDateTime = props?.inputType === "datetime-local";
  const isCheckbox = props.type === "checkbox" || props.fieldData?.valueEditorType === "checkbox";
  // API client maps null inputType → undefined; checkbox fields must not use autocomplete
  const isAutocomplete =
    props.fieldData?.inputType === undefined &&
    !isCheckbox &&
    !NON_TEXT_EDITOR_TYPES.has(props.type);
  const onPaste = useInNotInPasteHandler(props.operator, props.handleOnChange);
  const antdExtraProps =
    props.operator === "in" || props.operator === "notIn" ? { onPaste } : undefined;

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
    <AntDValueEditor {...props} extraProps={antdExtraProps} />
  );

  if (isCheckbox) {
    return editor;
  }

  return <FullWidthValueEditor>{editor}</FullWidthValueEditor>;
};
