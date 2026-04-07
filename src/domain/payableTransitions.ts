import type { PayableAccountStatus, UserRole } from '@/types/domain';

const DRAFT: PayableAccountStatus = 'draft';
const PENDING: PayableAccountStatus = 'pending_approval';
const APPROVED: PayableAccountStatus = 'approved';
const SCHEDULED: PayableAccountStatus = 'scheduled';
const PAID: PayableAccountStatus = 'paid';
const CANCELLED: PayableAccountStatus = 'cancelled';

const transitions: Record<
  PayableAccountStatus,
  readonly PayableAccountStatus[]
> = {
  [DRAFT]: [PENDING, CANCELLED],
  [PENDING]: [APPROVED, DRAFT, CANCELLED],
  [APPROVED]: [SCHEDULED, PENDING, CANCELLED],
  [SCHEDULED]: [PAID, APPROVED, CANCELLED],
  [PAID]: [],
  [CANCELLED]: [],
};

const approverRoles: UserRole[] = [
  'admin',
  'finance_manager',
  'approver',
];

export function canTransitionPayableStatus(
  from: PayableAccountStatus,
  to: PayableAccountStatus,
  role: UserRole
): boolean {
  if (role === 'viewer') {
    return false;
  }

  const allowed = transitions[from];
  if (!allowed.includes(to)) {
    return false;
  }

  if (from === PENDING && to === APPROVED) {
    return approverRoles.includes(role);
  }

  return true;
}
