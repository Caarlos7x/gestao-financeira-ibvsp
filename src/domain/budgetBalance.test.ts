import { describe, expect, it } from 'vitest';
import { computeBudgetBalance } from '@/domain/budgetBalance';

describe('computeBudgetBalance', () => {
  it('detects over budget scenarios', () => {
    const result = computeBudgetBalance(1000, 1200);
    expect(result.isOverBudget).toBe(true);
    expect(result.remaining).toBe(-200);
  });

  it('computes utilization ratio', () => {
    const result = computeBudgetBalance(1000, 250);
    expect(result.utilizationRatio).toBe(0.25);
    expect(result.isOverBudget).toBe(false);
  });
});
