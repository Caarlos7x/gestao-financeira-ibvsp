import { describe, expect, it } from 'vitest';
import { canTransitionPayableStatus } from '@/domain/payableTransitions';

describe('canTransitionPayableStatus', () => {
  it('blocks viewers from any transition', () => {
    expect(
      canTransitionPayableStatus('draft', 'pending_approval', 'viewer')
    ).toBe(false);
  });

  it('allows approvers to approve pending payables', () => {
    expect(
      canTransitionPayableStatus('pending_approval', 'approved', 'approver')
    ).toBe(true);
  });

  it('blocks analysts from approving pending payables', () => {
    expect(
      canTransitionPayableStatus('pending_approval', 'approved', 'analyst')
    ).toBe(false);
  });
});
