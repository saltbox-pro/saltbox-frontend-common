const INVALID_FALLBACK_PATHS = new Set([
  "/",
  "/core",
  "/core/minions",
  "/inventory",
  "/gateway",
  "/core/task",
]);

type NavigationWithEntries = {
  currentEntry: { index?: number } | null;
  entries(): Array<{ url: string }>;
};

const getNavigation = (): NavigationWithEntries | undefined => {
  return (window as Window & { navigation?: NavigationWithEntries }).navigation;
};

const isNestedPage = (): boolean => {
  return window.location.pathname.split("/").filter(Boolean).length > 2;
};

const isSameOriginUrl = (url: string): boolean => {
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
};

const isOidcCallbackUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    if (!isSameOriginUrl(url)) {
      return false;
    }

    return parsedUrl.searchParams.has("state") && parsedUrl.searchParams.has("code");
  } catch {
    return false;
  }
};

const isSaltBoxAppPathname = (pathname: string): boolean => {
  return (
    pathname.startsWith("/core") ||
    pathname.startsWith("/gateway") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/scheduler") ||
    pathname.startsWith("/scenarios")
  );
};

const isSaltBoxAppUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    if (!isSameOriginUrl(url)) {
      return false;
    }

    if (isOidcCallbackUrl(url)) {
      return false;
    }

    if (parsedUrl.pathname.startsWith("/auth/")) {
      return false;
    }

    return isSaltBoxAppPathname(parsedUrl.pathname);
  } catch {
    return false;
  }
};

export const getDefaultParentPath = (): string => {
  const pathname = window.location.pathname;
  const segments = pathname.split("/").filter(Boolean).slice(0, -1);

  return "/" + segments.join("/");
};

const isValidFallbackPath = (path: string): boolean => {
  if (!path || INVALID_FALLBACK_PATHS.has(path)) {
    return false;
  }

  if (path.split("/").filter(Boolean).length === 0) {
    return false;
  }

  if (path === window.location.pathname) {
    return false;
  }

  if (/\/minions\/[^/]+\/tasks$/.test(path)) {
    return false;
  }

  return true;
};

export const resolveFallbackParentPath = (
  customParentPathGenerator?: () => string
): string | null => {
  const fallback = customParentPathGenerator?.() ?? getDefaultParentPath();

  if (!isValidFallbackPath(fallback)) {
    return null;
  }

  return fallback;
};

const getImmediatePreviousEntryUrl = (): string | null => {
  const navigation = getNavigation();

  if (!navigation?.entries) {
    return null;
  }

  const currentIndex = navigation.currentEntry?.index;

  if (typeof currentIndex !== "number" || currentIndex <= 0) {
    return null;
  }

  return navigation.entries()[currentIndex - 1]?.url ?? null;
};

export const canGoBackInApp = (): boolean => {
  const previousEntryUrl = getImmediatePreviousEntryUrl();

  if (previousEntryUrl) {
    return isSaltBoxAppUrl(previousEntryUrl);
  }

  const idx = window.history.state?.idx;

  if (typeof idx !== "number" || idx <= 0) {
    return false;
  }

  if (getNavigation()?.entries) {
    return false;
  }

  return true;
};

export const goBackInApp = (): boolean => {
  if (!canGoBackInApp()) {
    return false;
  }

  window.history.back();
  return true;
};

export const navigateToFallbackPath = (path: string): void => {
  window.history.replaceState(window.history.state, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

class BackButtonProvider {
  shouldShowBackButton(customParentPathGenerator?: () => string): boolean {
    if (canGoBackInApp()) {
      return true;
    }

    if (!isNestedPage()) {
      return false;
    }

    return resolveFallbackParentPath(customParentPathGenerator) !== null;
  }
}

export const backButtonProvider = new BackButtonProvider();
