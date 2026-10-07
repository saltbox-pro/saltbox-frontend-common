import { useCallback, useRef, useState, type ReactNode } from "react";

import { Modal } from "../../antd-wrappers/modal";

const EXPORT_TO_CSV_MODAL_WIDTH = 640;

export type UseExportToCsvOptions = {
  onExport: () => Promise<boolean>;
  title: string;
  content: ReactNode;
  okText: string;
  cancelText: string;
};

export function useExportToCsv({
  onExport,
  title,
  content,
  okText,
  cancelText,
}: UseExportToCsvOptions): {
  isExporting: boolean;
  openConfirm: () => void;
  modalContextHolder: ReactNode;
} {
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [isExporting, setIsExporting] = useState(false);
  const isExportingRef = useRef(false);

  const openConfirm = useCallback(() => {
    if (isExportingRef.current) {
      return;
    }

    modalApi.confirm({
      title,
      icon: null,
      width: EXPORT_TO_CSV_MODAL_WIDTH,
      content,
      okText,
      cancelText,
      onOk: async () => {
        if (isExportingRef.current) {
          return;
        }

        isExportingRef.current = true;
        setIsExporting(true);

        try {
          const ok = await onExport();
          if (!ok) {
            return Promise.reject();
          }
        } finally {
          isExportingRef.current = false;
          setIsExporting(false);
        }
      },
    });
  }, [cancelText, content, modalApi, okText, onExport, title]);

  return {
    isExporting,
    openConfirm,
    modalContextHolder,
  };
}
