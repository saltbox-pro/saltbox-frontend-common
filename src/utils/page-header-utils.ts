class BackButtonProvider {
  private readonly MIN_HISTORY_INDEX = 1;
  private readonly MIN_PATH_DEPTH = 3;

  private navigationDepthCache = new Map<string, number>();
  private moduleRootDepthCache = new Map<string, number>();

  shouldShowBackButton(): boolean {
    const pathname = window.location.pathname;
    const hasHistoryState = window.history.state?.idx > this.MIN_HISTORY_INDEX;

    const isExcludedPath = pathname.includes("/minions");

    const pathDepth = pathname.split("/").length - 1;
    const segments = pathname.split("/").filter(Boolean);
    const segmentsDepth = segments.length;

    let hasSufficientPathDepth = pathDepth >= this.MIN_PATH_DEPTH;

    const [module, secondLevel] = segments;

    const moduleRootDepth = this.moduleRootDepthCache.get(module) ?? segmentsDepth;
    this.moduleRootDepthCache.set(module, Math.min(moduleRootDepth, segmentsDepth));

    if (module && secondLevel && pathDepth === 2) {
      const cacheKey = `${module}/${secondLevel}`;
      const maxDepthSeen = this.navigationDepthCache.get(cacheKey) || 1;

      if (segmentsDepth > moduleRootDepth) {
        this.navigationDepthCache.set(cacheKey, segmentsDepth);
      }

      const isIntermediatePage = maxDepthSeen > moduleRootDepth;
      hasSufficientPathDepth = isIntermediatePage;
    }

    return hasHistoryState && hasSufficientPathDepth && !isExcludedPath;
  }
}

export const backButtonProvider = new BackButtonProvider();
