import { Input } from "antd";
import type { ChangeEvent } from "react";

import type { LocalizedTextControlSharedProps } from "../hooks/use-localized-text-control";

import { LocalizedTextControlRoot } from "./localized-text-control-root";

export type LocalizedInputProps = LocalizedTextControlSharedProps;

export function LocalizedInput({ id, ...props }: LocalizedInputProps) {
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
        <Input
          id={id}
          disabled={disabled}
          readOnly={readOnly}
          status={status}
          value={currentValue}
          placeholder={resolvedPlaceholder}
          onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange(event.target.value)}
          onBlur={handleBlur}
        />
      )}
    </LocalizedTextControlRoot>
  );
}
