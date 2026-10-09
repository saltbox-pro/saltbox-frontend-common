import type { ReactNode } from "react";

import styles from "./status-badge.module.css";
import type { StatusTone } from "./status-tones";

export type StatusBadgeSize = "default" | "prominent";

export type StatusBadgeProps = {
  tone: StatusTone;
  size?: StatusBadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  title?: string;
  className?: string;
};

export function StatusBadge({
  tone,
  size = "default",
  icon,
  children,
  title,
  className,
}: StatusBadgeProps) {
  const classNames = [styles.badge, styles[tone], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} title={title} data-tone={tone} data-size={size}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
