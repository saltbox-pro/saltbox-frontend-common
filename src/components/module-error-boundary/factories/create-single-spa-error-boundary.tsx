import type { ErrorInfo, ReactElement } from "react";

import { ModuleErrorFallback } from "../fallbacks/module-error-fallback";

export function createSingleSpaErrorBoundary(moduleName: string) {
  return (error: unknown, info: ErrorInfo): ReactElement => {
    console.error(`[${moduleName}] Uncaught error:`, error, info);
    return <ModuleErrorFallback error={error} moduleName={moduleName} />;
  };
}
