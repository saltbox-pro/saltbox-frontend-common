export function shouldShowBackButton(): boolean {
  const hasHistoryState = window.history.state?.idx > 1;

  const pathDepth = window.location.pathname.split("/").length - 1;
  const hasSufficientPathDepth = pathDepth >= 3;

  const isExcludedPath = window.location.pathname.includes("/minions");

  return hasHistoryState && hasSufficientPathDepth && !isExcludedPath;
}
