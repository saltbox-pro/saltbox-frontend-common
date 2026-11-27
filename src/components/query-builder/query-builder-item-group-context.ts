import type { RuleGroupTypeAny } from "react-querybuilder";

type QueryBuilderItemGroupContext = {
  itemGroupQuery?: RuleGroupTypeAny;
};

function isQueryBuilderItemGroupContext(context: unknown): context is QueryBuilderItemGroupContext {
  if (context == null || typeof context !== "object") {
    return false;
  }

  if (!("itemGroupQuery" in context)) {
    return true;
  }

  const query = (context as { itemGroupQuery: unknown }).itemGroupQuery;
  return query === undefined || (query != null && typeof query === "object" && "rules" in query);
}

export function resolveItemGroupQuery(
  liveQuery: RuleGroupTypeAny | undefined,
  context: unknown
): RuleGroupTypeAny | undefined {
  if (liveQuery !== undefined) {
    return liveQuery;
  }

  if (!isQueryBuilderItemGroupContext(context)) {
    return undefined;
  }

  return context.itemGroupQuery;
}
