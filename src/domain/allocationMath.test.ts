import { describe, expect, it } from 'vitest';
import { applyAllocationAmounts, validateAllocationPercentages } from '@/domain/allocationMath';

describe('validateAllocationPercentages', () => {
  it('accepts valid splits', () => {
    const result = validateAllocationPercentages([
      { costCenterId: 'a', percentage: 60 },
      { costCenterId: 'b', percentage: 40 },
    ]);
    expect(result).toEqual({ ok: true });
  });

  it('rejects when sum is not 100', () => {
    const result = validateAllocationPercentages([
      { costCenterId: 'a', percentage: 50 },
      { costCenterId: 'b', percentage: 40 },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe('applyAllocationAmounts', () => {
  it('distributes amounts by percentage', () => {
    const amounts = applyAllocationAmounts(200, [
      { costCenterId: 'a', percentage: 50 },
      { costCenterId: 'b', percentage: 50 },
    ]);
    expect(amounts).toEqual([
      { costCenterId: 'a', amount: 100 },
      { costCenterId: 'b', amount: 100 },
    ]);
  });
});
