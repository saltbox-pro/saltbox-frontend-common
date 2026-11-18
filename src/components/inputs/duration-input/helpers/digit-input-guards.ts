interface KeyStroke {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

interface InputSnapshot {
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
}

export const DEFAULT_DURATION_INPUT_PRECISION = 0;

const buildDurationValuePattern = (precision: number): RegExp => {
  if (precision <= 0) {
    return /^\d+$/;
  }
  return new RegExp(`^\\d+(\\.\\d{0,${precision}})?$`);
};

const getReplacedInputValue = (input: InputSnapshot, inserted: string): string => {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  return `${input.value.slice(0, start)}${inserted}${input.value.slice(end)}`;
};

export const isDurationPasteAllowed = (
  text: string,
  precision: number = DEFAULT_DURATION_INPUT_PRECISION,
  input?: InputSnapshot
): boolean => {
  const candidate = input == null ? text : getReplacedInputValue(input, text);
  return buildDurationValuePattern(precision).test(candidate);
};

export const isForbiddenDurationInputKey = (
  event: KeyStroke,
  input?: InputSnapshot,
  precision: number = DEFAULT_DURATION_INPUT_PRECISION
): boolean => {
  const { key, ctrlKey, metaKey, altKey } = event;
  if (!(key.length === 1 && !ctrlKey && !metaKey && !altKey)) {
    return false;
  }

  const allowsDecimal = precision > 0;
  if (!/^\d$/.test(key) && !(allowsDecimal && key === ".")) {
    return true;
  }
  if (input == null) {
    return false;
  }

  return !isDurationPasteAllowed(key, precision, input);
};
