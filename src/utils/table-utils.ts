import { useEffect, useRef, useState } from "react";

/**
 * Provides stable loading state management to prevent UI flickering during fast loading operations.
 * Enables delay before showing the loading state and minimum duration for displaying it once shown.
 * Synchronizes data updates with loading state to prevent rendering stale data during transitions.
 *
 * @param isLoading - Current loading state from the parent component
 * @param data - Data to be synchronized with the loading state
 * @param options.delay - Delay in milliseconds before showing the loading state (default: 200ms)
 * @param options.minDuration - Minimum duration in milliseconds to show loading state once displayed (default: 300ms)
 * @returns stableIsLoading - Stable loading state that prevents flickering for fast operations
 * @returns stableData - Data synchronized with loading state to prevent showing stale content
 *
 * @example
 * ```typescript
 * // Basic usage with data synchronization
 * const { stableIsLoading, stableData } = useStableLoading(isApiLoading, tableData);
 *
 * // Custom timing for very fast operations
 * const { stableIsLoading, stableData } = useStableLoading(isApiLoading, tableData, {
 *   delay: 150,      // Wait 150ms before showing spinner
 *   minDuration: 500 // Show spinner for at least 500ms
 * });
 *
 * return (
 *   <div>
 *     {stableIsLoading && <Spinner />}
 *     <Table data={stableData} />
 *   </div>
 * );
 * ```
 */
export function useStableLoading<DataType>(
  isLoading: boolean,
  data?: DataType,
  options: { delay?: number; minDuration?: number } = {}
) {
  const { delay = 200, minDuration = 300 } = options;

  const [stableIsLoading, setStableIsLoading] = useState(false);
  const [stableData, setStableData] = useState<DataType>(data);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const loadingStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (isLoading) {
      // isLoading was set to "true"
      showTimer.current = setTimeout(() => {
        setStableIsLoading(true);
        loadingStartTime.current = Date.now();
      }, delay);
    }

    if (!isLoading && loadingStartTime.current) {
      // isLoading was set to "false" after the delay
      const elapsed = Date.now() - loadingStartTime.current;
      const remaining = Math.max(0, minDuration - elapsed);

      hideTimer.current = setTimeout(() => {
        setStableIsLoading(false);
        setStableData(data);
        loadingStartTime.current = null;
      }, remaining);
    }

    if (!isLoading && !loadingStartTime.current) {
      // not the loading state
      setStableData(data);
    }

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isLoading, data, delay, minDuration]);

  return { stableIsLoading, stableData };
}
