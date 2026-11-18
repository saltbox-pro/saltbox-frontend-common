import { InputNumber, Select, type InputNumberProps } from "antd";
import { useMemo, type ClipboardEvent, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { type DurationUnit } from "../../../../utils/duration";
import {
  DEFAULT_DURATION_INPUT_PRECISION,
  isDurationPasteAllowed,
  isForbiddenDurationInputKey,
} from "../helpers/digit-input-guards";

const UNIT_SELECT_WIDTH = 110;

const formatDurationValue = (
  value: string | number | undefined,
  info: { userTyping: boolean; input: string },
  precision: number
): string => {
  if (info.userTyping) {
    return info.input;
  }
  if (value === undefined || value === "") {
    return "";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  if (precision <= 0) {
    return String(Math.round(numeric));
  }
  return String(parseFloat(numeric.toFixed(precision)));
};

type InheritedInputNumberProps = Omit<
  InputNumberProps<number>,
  "value" | "defaultValue" | "onChange" | "addonAfter" | "addonBefore" | "precision" | "inputMode"
>;

export interface DurationInputProps<
  TUnit extends DurationUnit = DurationUnit,
> extends InheritedInputNumberProps {
  value: number | null;
  unit: TUnit;
  units: ReadonlyArray<TUnit>;
  onValueChange: (value: number | null) => void;
  onUnitChange: (unit: TUnit) => void;
  precision?: number;
}

export function DurationInput<TUnit extends DurationUnit = DurationUnit>({
  value,
  unit,
  units,
  onValueChange,
  onUnitChange,
  min = 0,
  precision = DEFAULT_DURATION_INPUT_PRECISION,
  disabled,
  onKeyDown,
  onPaste,
  ...inputNumberProps
}: DurationInputProps<TUnit>) {
  const { t } = useTranslation("common");

  const unitOptions = useMemo(
    () => units.map((option) => ({ value: option, label: t(`duration-input.units.${option}`) })),
    [t, units]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    if (
      isForbiddenDurationInputKey(
        event,
        {
          value: target.value,
          selectionStart: target.selectionStart,
          selectionEnd: target.selectionEnd,
        },
        precision
      )
    ) {
      event.preventDefault();
    }
    onKeyDown?.(event);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    if (
      !isDurationPasteAllowed(event.clipboardData.getData("text"), precision, {
        value: target.value,
        selectionStart: target.selectionStart,
        selectionEnd: target.selectionEnd,
      })
    ) {
      event.preventDefault();
    }
    onPaste?.(event);
  };

  return (
    <InputNumber<number>
      {...inputNumberProps}
      min={min}
      precision={precision}
      inputMode={precision > 0 ? "decimal" : "numeric"}
      formatter={(nextValue, info) => formatDurationValue(nextValue, info, precision)}
      value={value ?? undefined}
      onChange={(nextValue) => onValueChange(nextValue ?? null)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      disabled={disabled}
      addonAfter={
        <Select<TUnit>
          value={unit}
          options={unitOptions}
          onChange={onUnitChange}
          disabled={disabled}
          style={{ width: UNIT_SELECT_WIDTH }}
        />
      }
    />
  );
}
