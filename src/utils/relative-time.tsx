import { type ConfigType } from "dayjs";
import { type ReactElement, useMemo } from "react";

import { Popover } from "../components/antd-wrappers/popover";

import { formatTimeByUserTZ, pastTimeByUserTZ } from "./datetime";

interface RelativeTimeProps {
  date: ConfigType | null | undefined;
  fallback?: ReactElement;
}

export const RelativeTime = ({ date, fallback }: RelativeTimeProps) => {
  const formated = useMemo(() => (date ? formatTimeByUserTZ(date) : null), [date]);
  const ago = useMemo(() => (date ? pastTimeByUserTZ(date) : null), [date]);

  if (!date) return fallback ?? null;

  return <Popover content={formated}>{ago}</Popover>;
};
