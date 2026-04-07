export interface BudgetBalanceResult {
  remaining: number;
  isOverBudget: boolean;
  utilizationRatio: number;
}

export function computeBudgetBalance(
  plannedAmount: number,
  actualAmount: number
): BudgetBalanceResult {
  if (plannedAmount < 0 || actualAmount < 0) {
    throw new Error('Amounts must be non-negative.');
  }

  const remaining = plannedAmount - actualAmount;
  const isOverBudget = actualAmount > plannedAmount;
  const utilizationRatio =
    plannedAmount === 0 ? 0 : actualAmount / plannedAmount;

  return { remaining, isOverBudget, utilizationRatio };
}
