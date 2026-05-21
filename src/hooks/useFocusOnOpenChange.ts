import { useCallback, useMemo, useRef, type Ref } from "react";

import { mergeRefs } from "saltbox-common/utils/merge-refs";

type FocusableInstance = {
  focus: (options?: FocusOptions) => void;
};

export type UseFocusOnOpenChangeOptions<T extends FocusableInstance> = {
  ref?: Ref<T>;
  preventScroll?: boolean;
};

export function useFocusOnOpenChange<T extends FocusableInstance = FocusableInstance>(
  options: UseFocusOnOpenChangeOptions<T> = {}
) {
  const { ref: externalRef, preventScroll = true } = options;
  const elementRef = useRef<T>(null);
  const mergedRef = useMemo(() => mergeRefs(elementRef, externalRef), [externalRef]);

  const focus = useCallback(() => {
    requestAnimationFrame(() => {
      elementRef.current?.focus({ preventScroll });
    });
  }, [preventScroll]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        focus();
      }
    },
    [focus]
  );

  return { ref: mergedRef, onOpenChange, focus };
}
