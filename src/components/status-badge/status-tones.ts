export const STATUS_TONES = [
  "success",
  "active",
  "pending",
  "warning",
  "danger",
  "special",
  "info",
] as const;

export type StatusTone = (typeof STATUS_TONES)[number];

export const STATUS_TONE_COLORS: Record<StatusTone, string> = {
  success: "#52C41A",
  active: "#1677FF",
  pending: "#8C8C8C",
  warning: "#FA8C16",
  danger: "#FF4D4F",
  special: "#722ED1",
  info: "#13C2C2",
};
