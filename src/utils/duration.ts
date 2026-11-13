export type DurationTranslateFn = (key: string, options?: Record<string, unknown>) => string;

export type DurationUnit = "milliseconds" | "seconds" | "minutes" | "hours" | "days";

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;

export const DURATION_UNIT_SECONDS: Record<DurationUnit, number> = {
  milliseconds: 0.001,
  seconds: 1,
  minutes: SECONDS_IN_MINUTE,
  hours: SECONDS_IN_HOUR,
  days: SECONDS_IN_DAY,
};

const DURATION_VALUE_PRECISION = 2;

export const convertDurationUnitToSeconds = (value: number, unit: DurationUnit): number => {
  const seconds = value * DURATION_UNIT_SECONDS[unit];
  if (unit === "milliseconds") {
    return Number(seconds.toFixed(3));
  }
  return Math.round(seconds);
};

const formatUnitValue = (value: number, unit: DurationUnit, t: DurationTranslateFn): string =>
  `${value} ${t(`time-units.${unit}`)}`;

export const formatDuration = (durationSeconds: number, t: DurationTranslateFn): string => {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return "";
  }

  if (durationSeconds === 0) {
    return formatUnitValue(0, "seconds", t);
  }

  if (durationSeconds < 1) {
    return formatUnitValue(Math.round(durationSeconds * 1000), "milliseconds", t);
  }

  const totalSeconds = Number(durationSeconds.toFixed(DURATION_VALUE_PRECISION));
  const days = Math.floor(totalSeconds / SECONDS_IN_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_IN_DAY) / SECONDS_IN_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
  const seconds = Number((totalSeconds % SECONDS_IN_MINUTE).toFixed(DURATION_VALUE_PRECISION));

  return [
    days > 0 ? formatUnitValue(days, "days", t) : null,
    hours > 0 ? formatUnitValue(hours, "hours", t) : null,
    minutes > 0 ? formatUnitValue(minutes, "minutes", t) : null,
    seconds > 0 ? formatUnitValue(seconds, "seconds", t) : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" ");
};

export const formatDurationParts = (
  value: number,
  unit: DurationUnit,
  t: DurationTranslateFn
): string => {
  if (!Number.isFinite(value) || value < 0) {
    return "";
  }

  const stored = formatUnitValue(value, unit, t);
  if (value === 0) {
    return stored;
  }

  const breakdown = formatDuration(convertDurationUnitToSeconds(value, unit), t);
  return stored === breakdown ? stored : `${stored} (${breakdown})`;
};
