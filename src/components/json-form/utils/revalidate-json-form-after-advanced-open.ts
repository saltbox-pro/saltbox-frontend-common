type JsonFormLike = {
  validateForm: () => boolean;
};

type RevalidateJsonFormAfterAdvancedOpenParams = {
  shouldRevalidateRef: { current: boolean };
  isAdvanced: boolean;
  formRef: { current: JsonFormLike | null };
  onMissingForm?: () => void;
};

const scheduleAfterPaint = (callback: () => void): void => {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(callback);
    return;
  }
  setTimeout(callback, 0);
};

const tryRevalidate = (
  shouldRevalidateRef: { current: boolean },
  formRef: { current: JsonFormLike | null }
): boolean => {
  if (!shouldRevalidateRef.current) {
    return true;
  }

  const form = formRef.current;
  if (!form) {
    return false;
  }

  shouldRevalidateRef.current = false;
  form.validateForm();
  return true;
};

export const revalidateJsonFormAfterAdvancedOpen = ({
  shouldRevalidateRef,
  isAdvanced,
  formRef,
  onMissingForm,
}: RevalidateJsonFormAfterAdvancedOpenParams): void => {
  if (!shouldRevalidateRef.current || !isAdvanced) {
    return;
  }

  if (tryRevalidate(shouldRevalidateRef, formRef)) {
    return;
  }

  queueMicrotask(() => {
    if (!shouldRevalidateRef.current) {
      return;
    }

    if (tryRevalidate(shouldRevalidateRef, formRef)) {
      return;
    }

    scheduleAfterPaint(() => {
      if (!shouldRevalidateRef.current) {
        return;
      }

      if (tryRevalidate(shouldRevalidateRef, formRef)) {
        return;
      }

      if (onMissingForm) {
        shouldRevalidateRef.current = false;
        onMissingForm();
      }
    });
  });
};
