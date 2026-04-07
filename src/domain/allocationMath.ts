import type { AllocationSplit } from '@/types/domain';

const EPSILON = 0.0001;

export type AllocationValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateAllocationPercentages(
  splits: AllocationSplit[]
): AllocationValidationResult {
  if (splits.length === 0) {
    return { ok: false, reason: 'É necessário pelo menos um rateio.' };
  }

  for (const split of splits) {
    if (split.percentage < 0 || split.percentage > 100) {
      return { ok: false, reason: 'Os percentuais devem estar entre 0 e 100.' };
    }
  }

  const sum = splits.reduce((acc, s) => acc + s.percentage, 0);
  if (Math.abs(sum - 100) > EPSILON) {
    return {
      ok: false,
      reason: 'Os percentuais de rateio devem somar 100%.',
    };
  }

  return { ok: true };
}

export function applyAllocationAmounts(
  totalAmount: number,
  splits: AllocationSplit[]
): { costCenterId: string; amount: number }[] {
  const validation = validateAllocationPercentages(splits);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  return splits.map((split) => ({
    costCenterId: split.costCenterId,
    amount: (totalAmount * split.percentage) / 100,
  }));
}
