import type {
  ProcessNoticeAlert,
  ProcessNoticeChip,
  ProcessNoticeFooter,
  ProcessNoticeTone,
} from "../../interfaces/ui-events";

export type StoredProcessNotice = {
  title: string;
  description?: string;
  meta?: string;
  alert?: ProcessNoticeAlert;
  footer?: ProcessNoticeFooter;
  tone: ProcessNoticeTone;
  canClose: boolean;
  busy: boolean;
  durationSec: number | null;
  chips?: ProcessNoticeChip[];
  onClose?: () => void;
};
