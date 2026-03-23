import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, memo, useCallback } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";
import { SaltBoxMinionValueEditor } from "./salt-box-minion-value-editor";
import { SaltBoxMultiselectValueEditor } from "./salt-box-multiselect-value-editor";

export type OptionItem = { value: string; label?: string };

export type GetOptionsCallback = (
  field: string,
  value: unknown,
  setOptions: (options: OptionItem[]) => void
) => void;

export type SaltBoxOptionsValueEditorProps = ValueEditorProps & {
  getOptions?: GetOptionsCallback;
};

export const SaltBoxOptionsValueEditor: FC<SaltBoxOptionsValueEditorProps> = memo(
  ({ getOptions, ...props }) => {
    const handleValueChange = useCallback(
      (setOptions: (options: OptionItem[]) => void) => {
        getOptions?.(props.field, props.value, setOptions);
      },
      [getOptions, props.field, props.value]
    );

    if (props?.inputType === "datetime-local") {
      return <SaltBoxDateTimeValueEditor {...props} />;
    }
    if (props?.fieldData?.type === "multiselect") {
      return <SaltBoxMultiselectValueEditor {...props} />;
    }
    if (getOptions != null) {
      return <SaltBoxMinionValueEditor onValueChange={handleValueChange} {...props} />;
    }
    return <AntDValueEditor {...props} />;
  }
);
