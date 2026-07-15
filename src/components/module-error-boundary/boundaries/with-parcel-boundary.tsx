import type { ComponentType, FunctionComponent } from "react";

import type { BlockErrorFallbackVariant } from "../fallbacks/block-error-fallback";

import { BlockErrorBoundary } from "./block-error-boundary";

type WithParcelBoundaryOptions = {
  variant?: BlockErrorFallbackVariant;
};

type SingleSpaInjectedProps = {
  name?: string;
  singleSpa?: unknown;
  mountParcel?: unknown;
};

export function withParcelBoundary<P extends object>(
  Component: ComponentType<P>,
  parcelName: string,
  { variant = "default" }: WithParcelBoundaryOptions = {}
): FunctionComponent<P & SingleSpaInjectedProps> {
  const Wrapped: FunctionComponent<P & SingleSpaInjectedProps> = (props) => (
    <BlockErrorBoundary blockName={parcelName} variant={variant}>
      <Component {...(props as P)} />
    </BlockErrorBoundary>
  );

  const componentName = Component.displayName ?? Component.name ?? "Component";
  Wrapped.displayName = `withParcelBoundary(${componentName})`;

  return Wrapped;
}
