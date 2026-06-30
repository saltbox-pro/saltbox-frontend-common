import { AntDValueEditor } from "@react-querybuilder/antd";
import { FC, memo, useCallback } from "react";
import { ValueEditorProps } from "react-querybuilder";

import { FullWidthValueEditor } from "./full-width-value-editor";
import { SaltBoxDateTimeValueEditor } from "./salt-box-datetime-value-editor";
import { SaltBoxMinionValueEditor } from "./salt-box-minion-value-editor";
import { SaltBoxMultiselectValueEditor } from "./salt-box-multiselect-value-editor";
import { useInNotInPasteHandler } from "./utils/use-in-not-in-paste-handler";

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
    const onPaste = useInNotInPasteHandler(props.operator, props.handleOnChange);
    const antdExtraProps =
      props.operator === "in" || props.operator === "notIn" ? { onPaste } : undefined;

    const editor =
      props?.inputType === "datetime-local" ? (
        <SaltBoxDateTimeValueEditor {...props} />
      ) : props?.fieldData?.type === "multiselect" ? (
        <SaltBoxMultiselectValueEditor {...props} />
      ) : getOptions != null ? (
        <SaltBoxMinionValueEditor onValueChange={handleValueChange} {...props} />
      ) : (
        <AntDValueEditor {...props} extraProps={antdExtraProps} />
      );

    return <FullWidthValueEditor>{editor}</FullWidthValueEditor>;
  }
);
