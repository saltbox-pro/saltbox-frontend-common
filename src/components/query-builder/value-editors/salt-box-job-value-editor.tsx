import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, memo } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { FullWidthValueEditor } from "./full-width-value-editor";
import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";
import { SaltBoxMultiselectValueEditor } from "./salt-box-multiselect-value-editor";
import { useInNotInPasteHandler } from "./utils/use-in-not-in-paste-handler";

export const SaltBoxJobValueEditor: FC<ValueEditorProps> = memo((props) => {
  const onPaste = useInNotInPasteHandler(props.operator, props.handleOnChange);
  const antdExtraProps =
    props.operator === "in" || props.operator === "notIn" ? { onPaste } : undefined;

  const editor =
    props?.inputType === "datetime-local" ? (
      <SaltBoxDateTimeValueEditor {...props} />
    ) : props?.fieldData?.type === "multiselect" ? (
      <SaltBoxMultiselectValueEditor {...props} />
    ) : (
      <AntDValueEditor {...props} extraProps={antdExtraProps} />
    );

  return <FullWidthValueEditor>{editor}</FullWidthValueEditor>;
});
