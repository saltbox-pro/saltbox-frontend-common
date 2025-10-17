import { useCallback, useEffect } from "react";
import { subscribe, unsubscribe } from "saltbox-common/utils/custom-events";

export type CleanupEventDetail = {
  reason: "auth_error" | "navigation" | "logout" | "manual" | string;
  context?: Record<string, any>;
};

export function useUiCleanupEvent(
  onCleanup: (detail: CleanupEventDetail) => void,
  events: string[]
) {
  const handleEvent = useCallback((event: CustomEvent<CleanupEventDetail>) => {
    onCleanup(event.detail);
  }, []);

  useEffect(() => {
    events.forEach((eventType) => {
      subscribe(eventType, handleEvent);
    });

    return () => {
      events.forEach((eventType) => {
        unsubscribe(eventType, handleEvent);
      });
    };
  }, [events, onCleanup]);
}
