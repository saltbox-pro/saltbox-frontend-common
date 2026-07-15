import type { ComponentType } from "react";

import type { BlockErrorFallbackVariant } from "../fallbacks/block-error-fallback";

import { BlockErrorBoundary } from "./block-error-boundary";

type WithBlockBoundaryOptions = {
  variant?: BlockErrorFallbackVariant;
};

export function withBlockBoundary<P extends object>(
  Component: ComponentType<P>,
  blockName: string,
  { variant = "default" }: WithBlockBoundaryOptions = {}
): ComponentType<P> {
  const Wrapped = ((props: P) => (
    <BlockErrorBoundary blockName={blockName} variant={variant}>
      <Component {...props} />
    </BlockErrorBoundary>
  )) as ComponentType<P>;

  const componentName = Component.displayName ?? Component.name ?? "Component";
  Wrapped.displayName = `withBlockBoundary(${componentName})`;

  return Wrapped;
}
