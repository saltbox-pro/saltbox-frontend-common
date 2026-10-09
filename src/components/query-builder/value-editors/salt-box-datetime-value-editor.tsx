import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { ValueEditorProps } from "react-querybuilder";

import {
  DATETIME_FORMAT_FULL,
  parseApiDatetime,
  toApiDatetime,
} from "saltbox-common/utils/datetime";

function toEditorValue(value: unknown): Dayjs | undefined {
  if (value === "" || value == null) return undefined;
  if (dayjs.isDayjs(value)) return value;
  return parseApiDatetime(value as string);
}

export const SaltBoxDateTimeValueEditor = ({
  value,
  handleOnChange,
  title,
  className,
}: ValueEditorProps) => {
  const [internalValue, setInternalValue] = useState<Dayjs | undefined>(() => toEditorValue(value));

  useEffect(() => {
    const nextValue = toEditorValue(value);
    setInternalValue(nextValue);

    if (typeof value !== "string" || value === "" || !nextValue?.isValid()) {
      return;
    }

    const nextIso = toApiDatetime(nextValue);
    if (value !== nextIso) {
      handleOnChange(nextIso);
    }
  }, [value, handleOnChange]);

  const handleChange = (newInternalValue: Dayjs | null) => {
    setInternalValue(newInternalValue ?? undefined);
    handleOnChange(newInternalValue ? toApiDatetime(newInternalValue) : "");
  };

  return (
    <DatePicker
      value={internalValue}
      onChange={handleChange}
      showTime
      title={title}
      className={className}
      format={DATETIME_FORMAT_FULL}
      allowClear={false}
    />
  );
};
