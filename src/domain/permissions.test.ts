import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/domain/permissions';

describe('hasPermission', () => {
  it('grants finance managers payable approval', () => {
    expect(
      hasPermission('finance_manager', 'payables:approve')
    ).toBe(true);
  });

  it('denies viewers settings write', () => {
    expect(hasPermission('viewer', 'settings:write')).toBe(false);
  });
});
