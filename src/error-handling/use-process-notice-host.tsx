import { LoadingOutlined } from "@ant-design/icons";
import type { NotificationInstance } from "antd/es/notification/interface";
import { useEffect, useRef, useState } from "react";

import { UiEvent, type ProcessNoticeEventDetail } from "../interfaces/ui-events";
import { subscribe, unsubscribe } from "../utils/custom-events";

import { applyProcessNoticeEvent, type StoredProcessNotice } from "./apply-process-notice-event";
import { getProcessNoticeRenderRevision } from "./get-process-notice-render-revision";
import { setProcessNoticeHostReady } from "./process-notice";
import { ProcessNoticeDescription } from "./process-notice-description";
import { shouldApplyProcessNoticeEvent } from "./should-apply-process-notice-event";

export function useProcessNoticeHost(notificationApi: NotificationInstance): void {
  const [notices, setNotices] = useState(() => new Map<string, StoredProcessNotice>());
  const knownKeysRef = useRef(new Set<string>());
  const dismissedKeysRef = useRef(new Set<string>());
  const programmaticCloseKeysRef = useRef(new Set<string>());
  const openedRevisionRef = useRef(new Map<string, string>());
  const noticesRef = useRef(notices);
  noticesRef.current = notices;

  const destroyProgrammatically = (key: string) => {
    programmaticCloseKeysRef.current.add(key);
    notificationApi.destroy(key);
  };

  const destroySilently = (key: string) => {
    programmaticCloseKeysRef.current.delete(key);
    notificationApi.destroy(key);
  };

  useEffect(() => {
    const openedRevisions = openedRevisionRef.current;

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ProcessNoticeEventDetail>).detail;
      if (!detail) {
        return;
      }

      const decision = shouldApplyProcessNoticeEvent(dismissedKeysRef.current, detail);
      dismissedKeysRef.current = decision.nextDismissedKeys;
      if (!decision.apply) {
        return;
      }

      setNotices((prev) => applyProcessNoticeEvent(prev, detail));
    };

    subscribe(UiEvent.ProcessNotice, listener);
    setProcessNoticeHostReady(true);

    return () => {
      setProcessNoticeHostReady(false);
      unsubscribe(UiEvent.ProcessNotice, listener);
      for (const key of knownKeysRef.current) {
        destroyProgrammatically(key);
      }
      knownKeysRef.current.clear();
      openedRevisions.clear();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationApi]);

  useEffect(() => {
    const nextKeys = new Set(notices.keys());

    for (const key of knownKeysRef.current) {
      if (!nextKeys.has(key)) {
        destroySilently(key);
        openedRevisionRef.current.delete(key);
      }
    }

    for (const [key, notice] of notices) {
      if (dismissedKeysRef.current.has(key)) {
        destroySilently(key);
        openedRevisionRef.current.delete(key);
        continue;
      }

      const revision = getProcessNoticeRenderRevision(notice);
      if (openedRevisionRef.current.get(key) === revision) {
        continue;
      }

      notificationApi.open({
        key,
        type: notice.tone,
        message: notice.title,
        description: <ProcessNoticeDescription notice={notice} />,
        placement: "bottomRight",
        duration: notice.durationSec,
        closable: notice.canClose,
        icon: notice.busy ? <LoadingOutlined spin /> : undefined,
        onClose: () => {
          const isProgrammatic = programmaticCloseKeysRef.current.delete(key);
          const closedNotice = noticesRef.current.get(key);
          if (!isProgrammatic) {
            dismissedKeysRef.current.add(key);
            closedNotice?.onClose?.();
          }
          destroySilently(key);
          openedRevisionRef.current.delete(key);
          setNotices((prev) => {
            if (!prev.has(key)) {
              return prev;
            }
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        },
        style: { width: 384 },
        role: "status",
      });
      openedRevisionRef.current.set(key, revision);
    }

    knownKeysRef.current = nextKeys;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notices, notificationApi]);
}
