import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, ComponentProps } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { SaltBoxAutocompleteValueEditor } from "./salt-box-autocomplete-value-editor";
import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";

type AutoCompleteProps = ComponentProps<typeof SaltBoxAutocompleteValueEditor>;

export const SaltBoxMinionValueEditor: FC<
  ValueEditorProps & { onValueChange: AutoCompleteProps["onValueChange"] }
> = ({ onValueChange, ...props }) => {
  if (props?.inputType === "datetime-local") {
    if (
      props?.operator === "null" ||
      props?.operator === "notNull" ||
      props?.operator === "between" ||
      props?.operator === "notBetween"
    ) {
      return <></>;
    }
    return <SaltBoxDateTimeValueEditor {...props} />;
  }
  if (props.type === "checkbox") {
    return <AntDValueEditor {...props} />;
  }
  if (props.fieldData.inputType === undefined) {
    if (props?.operator === "null" || props?.operator === "notNull") {
      return <></>;
    }
    return <SaltBoxAutocompleteValueEditor onValueChange={onValueChange} {...props} />;
  }
  return <AntDValueEditor {...props} />;
};
