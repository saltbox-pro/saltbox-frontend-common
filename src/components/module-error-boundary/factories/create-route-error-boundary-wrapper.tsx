import type { ComponentType, ReactNode } from "react";

import { RouteErrorDisplay } from "../fallbacks/route-error-display";
import type {
  InjectedRouteErrorBoundary,
  ModuleErrorBoundaryRouting,
} from "../types/injected-components";

type RouteWrapperProps = {
  children: ReactNode;
};

const normalizePath = (path: string): string => {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/+$/, "") || "/";
};

export function createRouteErrorBoundaryWrapper(
  ErrorBoundary: InjectedRouteErrorBoundary,
  moduleName: string,
  homePath?: string,
  routing?: ModuleErrorBoundaryRouting
): ComponentType<RouteWrapperProps> {
  if (routing) {
    const { useNavigate, useLocation } = routing;

    return function RouteErrorBoundaryWrapper({ children }: RouteWrapperProps) {
      const navigate = useNavigate();
      const location = useLocation();

      return (
        <ErrorBoundary
          resetKeys={[location.pathname]}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <RouteErrorDisplay
              homePath={homePath}
              error={error}
              onRetry={resetErrorBoundary}
              onNavigateHome={
                homePath
                  ? () => {
                      if (normalizePath(location.pathname) === normalizePath(homePath)) {
                        resetErrorBoundary();
                        return;
                      }

                      navigate(homePath);
                    }
                  : undefined
              }
            />
          )}
          onError={(error, info) => {
            console.error(`[${moduleName}] Route error:`, error, info);
          }}
        >
          {children}
        </ErrorBoundary>
      );
    };
  }

  return function RouteErrorBoundaryWrapper({ children }: RouteWrapperProps) {
    return (
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <RouteErrorDisplay
            homePath={homePath}
            error={error}
            onRetry={resetErrorBoundary}
            onNavigateHome={homePath ? () => window.location.assign(homePath) : undefined}
          />
        )}
        onError={(error, info) => {
          console.error(`[${moduleName}] Route error:`, error, info);
        }}
      >
        {children}
      </ErrorBoundary>
    );
  };
}
