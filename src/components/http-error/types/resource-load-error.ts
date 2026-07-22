export type HttpErrorKind =
  | "not_found"
  | "forbidden"
  | "server"
  | "unavailable"
  | "network"
  | "generic";

export type ResourceLoadError = {
  status: number;
  message?: string;
  kind: HttpErrorKind;
};
