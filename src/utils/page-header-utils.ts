const INVALID_FALLBACK_PATHS = new Set(["/", "/core", "/inventory", "/gateway", "/core/task"]);

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

export const canGoBackInApp = (): boolean => {
  const navigation = getNavigation();

  if (navigation?.entries) {
    const currentIndex = navigation.currentEntry?.index;

    if (typeof currentIndex !== "number" || currentIndex <= 0) {
      return false;
    }

    const previousEntry = navigation.entries()[currentIndex - 1];

    if (!previousEntry) {
      return false;
    }

    try {
      return new URL(previousEntry.url).origin === window.location.origin;
    } catch {
      return false;
    }
  }

  const idx = window.history.state?.idx;

  return typeof idx === "number" && idx > 0;
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
