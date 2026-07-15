export const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return undefined;
};

const getNodeEnv = (): string | undefined => {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env;
  return env?.NODE_ENV;
};

export const isDevelopmentEnvironment = (): boolean => {
  if (getNodeEnv() === "development") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
};

export const getDevErrorDetails = (error: unknown): string | undefined => {
  if (!isDevelopmentEnvironment()) {
    return undefined;
  }

  return getErrorMessage(error);
};
