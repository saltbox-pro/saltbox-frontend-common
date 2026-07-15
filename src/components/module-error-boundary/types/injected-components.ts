import type { ComponentType, ReactElement, ReactNode } from "react";

export type InjectedRouteErrorBoundaryProps = {
  children?: ReactNode;
  resetKeys?: readonly unknown[];
  fallbackRender?: (props: { error: unknown; resetErrorBoundary: () => void }) => ReactNode;
  onError?: (error: unknown, info: { componentStack?: string | null }) => void;
};

export type InjectedRouteErrorBoundary = ComponentType<InjectedRouteErrorBoundaryProps>;

export type InjectedRouteProps = {
  key?: string | number;
  path?: string;
  element?: ReactElement;
};

export type InjectedRouteComponent = ComponentType<InjectedRouteProps>;

export type InjectedNavigate = (path: string) => void;

export type InjectedUseNavigate = () => InjectedNavigate;

export type InjectedLocation = {
  pathname: string;
};

export type InjectedUseLocation = () => InjectedLocation;

export type ModuleErrorBoundaryRouting = {
  useNavigate: InjectedUseNavigate;
  useLocation: InjectedUseLocation;
};
