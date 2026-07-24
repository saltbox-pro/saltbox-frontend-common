import { HttpErrorInline, type ResourceLoadError } from "saltbox-common/components/http-error";

type InfoDrawerErrorProps = {
  error: ResourceLoadError;
  onRetry?: () => void;
};

export function InfoDrawerError({ error, onRetry }: InfoDrawerErrorProps) {
  return <HttpErrorInline error={error} onRetry={onRetry} />;
}
