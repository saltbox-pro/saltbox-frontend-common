import { Component, Fragment, type ErrorInfo, type ReactNode } from "react";

import {
  BlockErrorFallback,
  type BlockErrorFallbackVariant,
} from "../fallbacks/block-error-fallback";

type BlockErrorBoundaryProps = {
  blockName?: string;
  variant?: BlockErrorFallbackVariant;
  title?: string;
  description?: string;
  fallback?: (args: { error: unknown; retry: () => void }) => ReactNode;
  children: ReactNode;
};

type BlockErrorBoundaryState = {
  hasError: boolean;
  error: unknown;
  retryKey: number;
};

export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  state: BlockErrorBoundaryState = { hasError: false, error: null, retryKey: 0 };

  static getDerivedStateFromError(error: unknown): Partial<BlockErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    const name = this.props.blockName ? ` (${this.props.blockName})` : "";
    console.error(`[BlockErrorBoundary${name}] Render error:`, error, info);
  }

  private retry = (): void => {
    this.setState((s) => ({ hasError: false, error: null, retryKey: s.retryKey + 1 }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, retry: this.retry });
      }

      return (
        <BlockErrorFallback
          variant={this.props.variant}
          title={this.props.title}
          description={this.props.description}
          error={this.state.error}
          onRetry={this.retry}
        />
      );
    }

    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
  }
}
