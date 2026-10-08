import dayjs, { ConfigType } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ru";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";

import { AppLanguage, DAYJS_LOCALE_MAP } from "../interfaces/locales";

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(updateLocale);

export const DATETIME_FORMAT_FULL = "DD.MM.YYYY HH:mm:ss";
export const DATETIME_TIMESTAMP = "YYYY-MM-DD HH:mm:ss";

const ISO_TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/;

export function parseApiDatetime(value: ConfigType): dayjs.Dayjs {
  if (typeof value === "string" && value !== "" && !ISO_TIMEZONE_PATTERN.test(value)) {
    // Backend often returns UTC without a timezone suffix. Parse as UTC, then switch
    // to local mode so DatePicker shows the user's timezone wall-clock time.
    return dayjs.utc(value).local();
  }

  return dayjs(value);
}

export function toApiDatetime(value: dayjs.Dayjs): string {
  return value.toISOString();
}

export function normalizeDatetimeFilterValue(value: string | number | boolean): string {
  if (typeof value !== "string" || value === "") {
    return String(value);
  }

  const parsed = parseApiDatetime(value);
  return parsed.isValid() ? toApiDatetime(parsed) : value;
}

export function pastTimeByUserTZ(compared: ConfigType): string {
  return dayjs(dayjs.utc(compared))
    .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .from(dayjs().tz(Intl.DateTimeFormat().resolvedOptions().timeZone));
}

export function formatTimeByUserTZ(
  date: ConfigType,
  templateFormat: string = DATETIME_FORMAT_FULL
): string {
  return dayjs(date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format(templateFormat);
}

export function setDateTimeLocale(locale: AppLanguage) {
  dayjs.locale(DAYJS_LOCALE_MAP[locale]);
  if (AppLanguage.RU === locale) {
    dayjs.updateLocale("ru", {
      weekStart: 1,
    });
  } else if (AppLanguage.EN === locale) {
    dayjs.updateLocale("en", {
      weekStart: 0,
    });
  }
}
