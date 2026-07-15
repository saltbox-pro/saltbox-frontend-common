import type { ReactElement } from "react";

import type {
  InjectedRouteComponent,
  InjectedRouteErrorBoundary,
  ModuleErrorBoundaryRouting,
} from "../types/injected-components";

import { createModuleRoutes, type ModuleRouteConfig } from "./create-module-routes";
import { createRouteErrorBoundaryWrapper } from "./create-route-error-boundary-wrapper";

export type CreateModuleErrorBoundaryKitOptions = {
  ErrorBoundary: InjectedRouteErrorBoundary;
  moduleName: string;
  homePath?: string;
  routing?: ModuleErrorBoundaryRouting;
};

export function createModuleErrorBoundaryKit({
  ErrorBoundary,
  moduleName,
  homePath,
  routing,
}: CreateModuleErrorBoundaryKitOptions) {
  const RouteWrapper = createRouteErrorBoundaryWrapper(
    ErrorBoundary,
    moduleName,
    homePath,
    routing
  );

  function createRoutes(
    Route: InjectedRouteComponent,
    routes: ModuleRouteConfig[]
  ): ReactElement[] {
    return createModuleRoutes(Route, routes, { RouteWrapper });
  }

  return { createRoutes, RouteWrapper };
}
