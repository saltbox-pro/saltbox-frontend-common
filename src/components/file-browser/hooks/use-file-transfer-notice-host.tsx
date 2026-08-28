import type { NotificationInstance } from "antd/es/notification/interface";
import { useEffect, useRef, useState } from "react";

import { UiEvent, type FileTransferNoticeEventDetail } from "../../../interfaces/ui-events";
import {
  applyFileTransferNoticeEvent,
  type StoredFileTransferNotice,
} from "../../../notifications/helpers/apply-file-transfer-notice-event";
import { setFileTransferNoticeHostReady } from "../../../notifications/model/file-transfer-notice";
import { subscribe, unsubscribe } from "../../../utils/custom-events";
import { FileBrowserUploadNotificationBody } from "../ui/file-browser-upload-notification-body";
import { getFileTransferNoticeRenderRevision } from "../utils/get-file-browser-uploads-content-revision";

function FileTransferNoticeDescription({ notice }: { notice: StoredFileTransferNotice }) {
  return (
    <FileBrowserUploadNotificationBody
      uploads={new Map(notice.transfers)}
      onCancelUpload={notice.onCancelTransfer}
      formatError={notice.formatError}
    />
  );
}

export function useFileTransferNoticeHost(notificationApi: NotificationInstance): void {
  const [notices, setNotices] = useState(() => new Map<string, StoredFileTransferNotice>());
  const knownKeysRef = useRef(new Set<string>());
  const dismissedKeysRef = useRef(new Set<string>());
  const openedRevisionRef = useRef(new Map<string, string>());

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<FileTransferNoticeEventDetail>).detail;
      if (!detail) {
        return;
      }

      if (detail.action === "upsert" || detail.action === "remove") {
        dismissedKeysRef.current.delete(detail.key);
      } else if (detail.action === "patch" && dismissedKeysRef.current.has(detail.key)) {
        return;
      }

      setNotices((prev) => applyFileTransferNoticeEvent(prev, detail));
    };

    subscribe(UiEvent.FileTransferNotice, listener);
    setFileTransferNoticeHostReady(true);

    return () => {
      setFileTransferNoticeHostReady(false);
      unsubscribe(UiEvent.FileTransferNotice, listener);
    };
  }, []);

  useEffect(() => {
    const nextKeys = new Set(notices.keys());

    for (const key of knownKeysRef.current) {
      if (!nextKeys.has(key)) {
        notificationApi.destroy(key);
        openedRevisionRef.current.delete(key);
      }
    }

    for (const [key, notice] of notices) {
      if (dismissedKeysRef.current.has(key)) {
        notificationApi.destroy(key);
        openedRevisionRef.current.delete(key);
        continue;
      }

      const revision = getFileTransferNoticeRenderRevision(notice);
      if (openedRevisionRef.current.get(key) === revision) {
        continue;
      }

      notificationApi.open({
        key,
        message: notice.title,
        description: <FileTransferNoticeDescription notice={notice} />,
        placement: "bottomRight",
        duration: null,
        closable: notice.canClose,
        onClose: () => {
          dismissedKeysRef.current.add(key);
          notificationApi.destroy(key);
          openedRevisionRef.current.delete(key);
          setNotices((prev) => {
            if (!prev.has(key)) {
              return prev;
            }
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
          notice.onClose();
        },
        style: { width: 384 },
        role: "status",
      });
      openedRevisionRef.current.set(key, revision);
    }

    knownKeysRef.current = nextKeys;
  }, [notices, notificationApi]);
}
