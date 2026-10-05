import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";
import type { ChangeEvent } from "react";

import type { LocalizedTextControlSharedProps } from "../hooks/use-localized-text-control";

import { LocalizedTextControlRoot } from "./localized-text-control-root";

export type LocalizedTextAreaProps = LocalizedTextControlSharedProps & {
  rows?: number;
  autoSize?: TextAreaProps["autoSize"];
};

export function LocalizedTextArea({ id, rows = 3, autoSize, ...props }: LocalizedTextAreaProps) {
  return (
    <LocalizedTextControlRoot {...props}>
      {({
        currentValue,
        status,
        resolvedPlaceholder,
        handleChange,
        handleBlur,
        disabled,
        readOnly,
      }) => (
        <Input.TextArea
          id={id}
          rows={rows}
          autoSize={autoSize}
          disabled={disabled}
          readOnly={readOnly}
          status={status}
          value={currentValue}
          placeholder={resolvedPlaceholder}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => handleChange(event.target.value)}
          onBlur={handleBlur}
        />
      )}
    </LocalizedTextControlRoot>
  );
}
