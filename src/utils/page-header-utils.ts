class BackButtonProvider {
  private readonly MIN_HISTORY_LENGTH = 1;
  private readonly MIN_PATH_DEPTH = 3;

  shouldShowBackButton(): boolean {
    const pathname = window.location.pathname;
    const hasHistoryState = window.history.length > this.MIN_HISTORY_LENGTH;

    const isExcludedPath = pathname.includes("/minions");

    const segments = pathname.split("/").filter(Boolean);
    const segmentsDepth = segments.length;

    let hasSufficientPathDepth = false;

    if (isExcludedPath) {
      hasSufficientPathDepth = segmentsDepth >= this.MIN_PATH_DEPTH + 1;
    } else {
      hasSufficientPathDepth = segmentsDepth >= this.MIN_PATH_DEPTH;
    }

    return hasHistoryState && hasSufficientPathDepth;
  }
}

export const backButtonProvider = new BackButtonProvider();
