import type { NotificationInstance } from "antd/es/notification/interface";
import { useEffect, useRef, useState } from "react";

import {
  applyUploadNoticeEvent,
  type StoredUploadNotice,
} from "../../../error-handling/apply-upload-notice-event";
import { setUploadNoticeHostReady } from "../../../error-handling/upload-notice";
import { UiEvent, type UploadNoticeEventDetail } from "../../../interfaces/ui-events";
import { subscribe, unsubscribe } from "../../../utils/custom-events";
import { FileBrowserUploadNotificationBody } from "../ui/file-browser-upload-notification-body";
import { getFileBrowserUploadsContentRevision } from "../utils/get-file-browser-uploads-content-revision";

function UploadNoticeDescription({ notice }: { notice: StoredUploadNotice }) {
  return (
    <FileBrowserUploadNotificationBody
      uploads={new Map(notice.uploads)}
      onCancelUpload={notice.onCancelUpload}
      formatError={notice.formatError}
    />
  );
}

function getNoticeRenderRevision(notice: StoredUploadNotice): string {
  return `${notice.title}\0${notice.canClose ? "1" : "0"}\0${getFileBrowserUploadsContentRevision(
    new Map(notice.uploads)
  )}`;
}

export function useUploadNoticeHost(notificationApi: NotificationInstance): void {
  const [notices, setNotices] = useState(() => new Map<string, StoredUploadNotice>());
  const knownKeysRef = useRef(new Set<string>());
  const dismissedKeysRef = useRef(new Set<string>());
  const openedRevisionRef = useRef(new Map<string, string>());

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<UploadNoticeEventDetail>).detail;
      if (!detail) {
        return;
      }

      if (detail.action === "upsert" || detail.action === "remove") {
        dismissedKeysRef.current.delete(detail.key);
      } else if (detail.action === "patch" && dismissedKeysRef.current.has(detail.key)) {
        return;
      }

      setNotices((prev) => applyUploadNoticeEvent(prev, detail));
    };

    subscribe(UiEvent.UploadNotice, listener);
    setUploadNoticeHostReady(true);

    return () => {
      setUploadNoticeHostReady(false);
      unsubscribe(UiEvent.UploadNotice, listener);
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

      const revision = getNoticeRenderRevision(notice);
      if (openedRevisionRef.current.get(key) === revision) {
        continue;
      }

      notificationApi.open({
        key,
        message: notice.title,
        description: <UploadNoticeDescription notice={notice} />,
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
