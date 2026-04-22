import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, memo } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { FullWidthValueEditor } from "./full-width-value-editor";
import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";
import { SaltBoxMultiselectValueEditor } from "./salt-box-multiselect-value-editor";

export const SaltBoxJobValueEditor: FC<ValueEditorProps> = memo((props) => {
  const editor =
    props?.inputType === "datetime-local" ? (
      <SaltBoxDateTimeValueEditor {...props} />
    ) : props?.fieldData?.type === "multiselect" ? (
      <SaltBoxMultiselectValueEditor {...props} />
    ) : (
      <AntDValueEditor {...props} />
    );

  return <FullWidthValueEditor>{editor}</FullWidthValueEditor>;
});
