import { Fragment, type ComponentType, type ReactElement, type ReactNode } from "react";

import type { InjectedRouteComponent } from "../types/injected-components";

export type ModuleRouteConfig = {
  path: string;
  element: ReactElement;
};

type RouteWrapperProps = {
  children: ReactNode;
};

type CreateModuleRoutesOptions = {
  RouteWrapper?: ComponentType<RouteWrapperProps>;
};

export function createModuleRoutes(
  Route: InjectedRouteComponent,
  routes: ModuleRouteConfig[],
  { RouteWrapper = Fragment }: CreateModuleRoutesOptions = {}
): ReactElement[] {
  return routes.map(({ path, element }) => (
    <Route key={path} path={path} element={<RouteWrapper>{element}</RouteWrapper>} />
  ));
}
