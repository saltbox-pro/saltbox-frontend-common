export const ITEM_COMBINATOR_AND = "andOnItem";
export const ITEM_COMBINATOR_OR = "orOnItem";

export type ItemCombinator = typeof ITEM_COMBINATOR_AND | typeof ITEM_COMBINATOR_OR;

export type QueryCombinator = "and" | "or" | ItemCombinator;

const ITEM_COMBINATORS = new Set<string>([ITEM_COMBINATOR_AND, ITEM_COMBINATOR_OR]);

export function isItemCombinator(combinator: string): combinator is ItemCombinator {
  return ITEM_COMBINATORS.has(combinator);
}
