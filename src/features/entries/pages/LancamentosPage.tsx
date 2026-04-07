import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useAuthContext } from '@/context/AuthContext';
import { useRepository } from '@/context/RepositoryContext';
import { hasPermission } from '@/domain/permissions';
import type { FinancialPlatformRepository } from '@/services/repositories/financialPlatformRepository';
import type {
  AssetStatus,
  BudgetPeriod,
  CompanyId,
  CostCenter,
  PayableAccountStatus,
  Supplier,
  TransactionDirection,
  UserRole,
} from '@/types/domain';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
import styles from '@/features/entries/pages/LancamentosPage.module.css';

const DEFAULT_CURRENCY = 'BRL';

const churchExpenseTypes = [
  { value: 'maintenance' as const, label: 'Manutenção' },
  { value: 'events' as const, label: 'Eventos' },
  { value: 'operations' as const, label: 'Operações' },
  { value: 'other' as const, label: 'Outros' },
];

const assetStatuses: { value: AssetStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'disposed', label: 'Alienado' },
  { value: 'retired', label: 'Baixado' },
];

const instrumentOptions = [
  { value: 'mercado_monetario', label: 'Mercado monetário' },
  { value: 'fixed_income', label: 'Renda fixa' },
  { value: 'money_market', label: 'Money market' },
];

const payableStatuses: { value: PayableAccountStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'pending_approval', label: 'Aguardando aprovação' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'scheduled', label: 'Agendado' },
];

function useRefsData(
  repository: FinancialPlatformRepository,
  companyId: CompanyId,
  tick: number
) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      repository.listCostCenters(companyId),
      repository.listBudgetPeriods(companyId),
      repository.listSuppliers(companyId),
    ])
      .then(([cc, bp, sup]) => {
        if (!cancelled) {
          setCostCenters(cc);
          setPeriods(bp);
          setSuppliers(sup);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : UI_MESSAGES_PT_BR.loadFailed
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, companyId, tick]);

  return { costCenters, periods, suppliers, loading, error };
}

function writeFlags(role: UserRole) {
  return {
    budgets: hasPermission(role, 'budgets:write'),
    payables: hasPermission(role, 'payables:write'),
    costCenters: hasPermission(role, 'cost_centers:write'),
  };
}

export function LancamentosPage() {
  const repository = useRepository();
  const { state } = useAuthContext();
  const role: UserRole =
    state.status === 'signed_in' ? state.profile.role : 'viewer';
  const flags = writeFlags(role);
  const canAnyWrite =
    flags.budgets || flags.payables || flags.costCenters;

  return (
    <section className="page">
      <PageHeader
        title={UI_MESSAGES_PT_BR.entriesPageTitle}
        description={UI_MESSAGES_PT_BR.entriesPageDescription}
      />
      {!canAnyWrite ? (
        <p className={styles.readOnlyBanner} role="status">
          {UI_MESSAGES_PT_BR.entriesReadOnlyNotice}
        </p>
      ) : null}
      <RequireSelectedCompany>
        {(companyId) => (
          <LancamentosBody
            repository={repository}
            companyId={companyId}
            flags={flags}
          />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type LancamentosBodyProps = {
  repository: FinancialPlatformRepository;
  companyId: CompanyId;
  flags: ReturnType<typeof writeFlags>;
};

function LancamentosBody({
  repository,
  companyId,
  flags,
}: LancamentosBodyProps) {
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  const { costCenters, periods, suppliers, loading, error } = useRefsData(
    repository,
    companyId,
    tick
  );

  if (loading) {
    return <p className="state-message">{UI_MESSAGES_PT_BR.loading}</p>;
  }
  if (error) {
    return <p className="state-message">{error}</p>;
  }

  const ccOptions = costCenters.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ));

  return (
    <div className="stack">
      <p className={styles.lead}>{UI_MESSAGES_PT_BR.entriesPageLead}</p>

      <Card title={UI_MESSAGES_PT_BR.entriesCardTransaction}>
        <TransactionForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          costCenterOptions={ccOptions}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardPayable}>
        <PayableForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.payables}
          suppliers={suppliers}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardSupplier}>
        <SupplierForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.payables}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardChurchExpense}>
        <ChurchExpenseForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardCostCenter}>
        <CostCenterForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.costCenters}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardBudget}>
        <BudgetForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          costCenterOptions={ccOptions}
          periods={periods}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardAllocation}>
        <AllocationForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          costCenterOptions={ccOptions}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardAsset}>
        <AssetForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardMinistry}>
        <MinistryForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          costCenterOptions={ccOptions}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardInvestment}>
        <InvestmentForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          onCreated={bump}
        />
      </Card>

      <Card title={UI_MESSAGES_PT_BR.entriesCardBankLine}>
        <BankLineForm
          companyId={companyId}
          repository={repository}
          disabled={!flags.budgets}
          onCreated={bump}
        />
      </Card>
    </div>
  );
}

type FormBase = {
  companyId: CompanyId;
  repository: FinancialPlatformRepository;
  disabled: boolean;
  onCreated: () => void;
};

function TransactionForm({
  companyId,
  repository,
  disabled,
  costCenterOptions,
  onCreated,
}: FormBase & { costCenterOptions: ReactNode }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<TransactionDirection>('expense');
  const [occurredAt, setOccurredAt] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      description: z.string().min(1, 'Informe a descrição.'),
      amount: z.coerce.number().positive('Valor deve ser positivo.'),
      occurredAt: z.string().min(1, 'Informe data e hora.'),
    });
    const parsed = schema.safeParse({
      description,
      amount,
      occurredAt,
    });
    if (!parsed.success) {
      setMsg({ type: 'err', text: parsed.error.issues[0]?.message ?? UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    let iso = parsed.data.occurredAt;
    if (!iso.includes('T')) {
      iso = `${iso}T12:00:00`;
    }
    setPending(true);
    try {
      await repository.createFinancialTransaction(companyId, {
        description: parsed.data.description,
        amount: parsed.data.amount,
        currencyCode: DEFAULT_CURRENCY,
        direction,
        occurredAt: new Date(iso).toISOString(),
        costCenterId: costCenterId || null,
        categoryId: null,
      });
      setDescription('');
      setAmount('');
      setOccurredAt('');
      setCostCenterId('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Descrição
        <input
          className="field-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Valor (R$)
          <input
            className="field-input"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="field-label">
          Tipo
          <select
            className="field-input"
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as TransactionDirection)
            }
            disabled={disabled}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>
      </div>
      <label className="field-label">
        Data e hora
        <input
          className="field-input"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Centro de custo (opcional)
        <select
          className="field-input"
          value={costCenterId}
          onChange={(e) => setCostCenterId(e.target.value)}
          disabled={disabled}
        >
          <option value="">—</option>
          {costCenterOptions}
        </select>
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function PayableForm({
  companyId,
  repository,
  disabled,
  suppliers,
  onCreated,
}: FormBase & { suppliers: Supplier[] }) {
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<PayableAccountStatus>('draft');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (!supplierId) {
      setMsg({ type: 'err', text: 'Selecione um fornecedor.' });
      return;
    }
    const schema = z.object({
      amount: z.coerce.number().positive(),
      dueDate: z.string().min(1),
    });
    const parsed = schema.safeParse({ amount, dueDate });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createPayableAccount(companyId, {
        supplierId,
        amount: parsed.data.amount,
        currencyCode: DEFAULT_CURRENCY,
        dueDate: parsed.data.dueDate,
        status,
      });
      setAmount('');
      setDueDate('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Fornecedor
        <select
          className="field-input"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          disabled={disabled}
        >
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Valor (R$)
          <input
            className="field-input"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="field-label">
          Vencimento
          <input
            className="field-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <label className="field-label">
        Status inicial
        <select
          className="field-input"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as PayableAccountStatus)
          }
          disabled={disabled}
        >
          {payableStatuses.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function SupplierForm({
  companyId,
  repository,
  disabled,
  onCreated,
}: FormBase) {
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      name: z.string().min(1, 'Informe o nome.'),
    });
    const parsed = schema.safeParse({ name });
    if (!parsed.success) {
      setMsg({ type: 'err', text: parsed.error.issues[0]?.message ?? '' });
      return;
    }
    setPending(true);
    try {
      await repository.createSupplier(companyId, {
        name: parsed.data.name,
        taxId: taxId.trim() || null,
      });
      setName('');
      setTaxId('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Nome
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        CNPJ / CPF (opcional)
        <input
          className="field-input"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function ChurchExpenseForm({
  companyId,
  repository,
  disabled,
  onCreated,
}: FormBase) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] =
    useState<(typeof churchExpenseTypes)[number]['value']>('operations');
  const [occurredAt, setOccurredAt] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      description: z.string().min(1),
      amount: z.coerce.number().positive(),
      occurredAt: z.string().min(1),
    });
    const parsed = schema.safeParse({ description, amount, occurredAt });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createChurchOperationalExpense(companyId, {
        description: parsed.data.description,
        amount: parsed.data.amount,
        currencyCode: DEFAULT_CURRENCY,
        expenseType,
        occurredAt: parsed.data.occurredAt,
        categoryId: null,
      });
      setDescription('');
      setAmount('');
      setOccurredAt('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Descrição
        <input
          className="field-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Valor (R$)
          <input
            className="field-input"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="field-label">
          Tipo de despesa
          <select
            className="field-input"
            value={expenseType}
            onChange={(e) =>
              setExpenseType(
                e.target.value as (typeof churchExpenseTypes)[number]['value']
              )
            }
            disabled={disabled}
          >
            {churchExpenseTypes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field-label">
        Data
        <input
          className="field-input"
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function CostCenterForm({
  companyId,
  repository,
  disabled,
  onCreated,
}: FormBase) {
  const [name, setName] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.safeParse({ name });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createCostCenter(companyId, {
        name: parsed.data.name,
        ownerUserId: ownerUserId.trim() || null,
      });
      setName('');
      setOwnerUserId('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Nome do centro
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        ID do responsável (opcional)
        <input
          className="field-input mono"
          value={ownerUserId}
          onChange={(e) => setOwnerUserId(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function BudgetForm({
  companyId,
  repository,
  disabled,
  costCenterOptions,
  periods,
  onCreated,
}: FormBase & {
  costCenterOptions: ReactNode;
  periods: BudgetPeriod[];
}) {
  const [costCenterId, setCostCenterId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (!costCenterId || !periodId) {
      setMsg({ type: 'err', text: 'Selecione centro e período.' });
      return;
    }
    const schema = z.object({
      plannedAmount: z.coerce.number().nonnegative(),
    });
    const parsed = schema.safeParse({ plannedAmount });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createBudget(companyId, {
        costCenterId,
        periodId,
        plannedAmount: parsed.data.plannedAmount,
        currencyCode: DEFAULT_CURRENCY,
      });
      setPlannedAmount('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Centro de custo
        <select
          className="field-input"
          value={costCenterId}
          onChange={(e) => setCostCenterId(e.target.value)}
          disabled={disabled}
        >
          <option value="">—</option>
          {costCenterOptions}
        </select>
      </label>
      <label className="field-label">
        Período orçamentário
        <select
          className="field-input"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          disabled={disabled}
        >
          <option value="">—</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.startDate} → {p.endDate}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Valor planejado (R$)
        <input
          className="field-input"
          type="number"
          min={0}
          step="0.01"
          value={plannedAmount}
          onChange={(e) => setPlannedAmount(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function AllocationForm({
  companyId,
  repository,
  disabled,
  costCenterOptions,
  onCreated,
}: FormBase & { costCenterOptions: ReactNode }) {
  const [name, setName] = useState('');
  const [traceabilityCode, setTraceabilityCode] = useState('');
  const [cc1, setCc1] = useState('');
  const [pct1, setPct1] = useState('60');
  const [cc2, setCc2] = useState('');
  const [pct2, setPct2] = useState('40');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      name: z.string().min(1),
      traceabilityCode: z.string().min(1),
    });
    const parsed = schema.safeParse({ name, traceabilityCode });
    if (!parsed.success || !cc1 || !cc2 || cc1 === cc2) {
      setMsg({
        type: 'err',
        text:
          !cc1 || !cc2
            ? 'Selecione dois centros de custo distintos.'
            : cc1 === cc2
              ? 'Os centros devem ser diferentes.'
              : UI_MESSAGES_PT_BR.invalidForm,
      });
      return;
    }
    const p1 = Number(pct1);
    const p2 = Number(pct2);
    setPending(true);
    try {
      await repository.createAllocationRule(companyId, {
        name: parsed.data.name,
        traceabilityCode: parsed.data.traceabilityCode,
        splits: [
          { costCenterId: cc1, percentage: p1 },
          { costCenterId: cc2, percentage: p2 },
        ],
      });
      setName('');
      setTraceabilityCode('');
      setCc1('');
      setCc2('');
      setPct1('60');
      setPct2('40');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Nome da regra
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Código de rastreabilidade
        <input
          className="field-input"
          value={traceabilityCode}
          onChange={(e) => setTraceabilityCode(e.target.value)}
          disabled={disabled}
        />
      </label>
      <p className={styles.formHint}>
        Os percentuais devem somar 100%. Duas fatias apenas neste formulário.
      </p>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Centro 1
          <select
            className="field-input"
            value={cc1}
            onChange={(e) => setCc1(e.target.value)}
            disabled={disabled}
          >
            <option value="">—</option>
            {costCenterOptions}
          </select>
        </label>
        <label className="field-label">
          % centro 1
          <input
            className="field-input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={pct1}
            onChange={(e) => setPct1(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Centro 2
          <select
            className="field-input"
            value={cc2}
            onChange={(e) => setCc2(e.target.value)}
            disabled={disabled}
          >
            <option value="">—</option>
            {costCenterOptions}
          </select>
        </label>
        <label className="field-label">
          % centro 2
          <input
            className="field-input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={pct2}
            onChange={(e) => setPct2(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function AssetForm({
  companyId,
  repository,
  disabled,
  onCreated,
}: FormBase) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionValue, setAcquisitionValue] = useState('');
  const [status, setStatus] = useState<AssetStatus>('active');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      acquisitionDate: z.string().min(1),
      acquisitionValue: z.coerce.number().nonnegative(),
    });
    const parsed = schema.safeParse({
      name,
      category,
      acquisitionDate,
      acquisitionValue,
    });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createAsset(companyId, {
        name: parsed.data.name,
        category: parsed.data.category,
        acquisitionDate: parsed.data.acquisitionDate,
        acquisitionValue: parsed.data.acquisitionValue,
        currencyCode: DEFAULT_CURRENCY,
        status,
        ownerUserId: ownerUserId.trim() || null,
      });
      setName('');
      setCategory('');
      setAcquisitionDate('');
      setAcquisitionValue('');
      setOwnerUserId('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Nome
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Categoria
        <input
          className="field-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={disabled}
          placeholder="ex.: veículo, imóvel"
        />
      </label>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Data de aquisição
          <input
            className="field-input"
            type="date"
            value={acquisitionDate}
            onChange={(e) => setAcquisitionDate(e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="field-label">
          Valor (R$)
          <input
            className="field-input"
            type="number"
            min={0}
            step="0.01"
            value={acquisitionValue}
            onChange={(e) => setAcquisitionValue(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Status
          <select
            className="field-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as AssetStatus)}
            disabled={disabled}
          >
            {assetStatuses.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          ID do responsável (opcional)
          <input
            className="field-input mono"
            value={ownerUserId}
            onChange={(e) => setOwnerUserId(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function MinistryForm({
  companyId,
  repository,
  disabled,
  costCenterOptions,
  onCreated,
}: FormBase & { costCenterOptions: ReactNode }) {
  const [name, setName] = useState('');
  const [leaderUserId, setLeaderUserId] = useState('');
  const [linkedCostCenterId, setLinkedCostCenterId] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.safeParse({ name });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createMinistry(companyId, {
        name: parsed.data.name,
        leaderUserId: leaderUserId.trim() || null,
        linkedCostCenterId: linkedCostCenterId || null,
      });
      setName('');
      setLeaderUserId('');
      setLinkedCostCenterId('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Nome do ministério
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        ID do líder (opcional)
        <input
          className="field-input mono"
          value={leaderUserId}
          onChange={(e) => setLeaderUserId(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Centro de custo vinculado (opcional)
        <select
          className="field-input"
          value={linkedCostCenterId}
          onChange={(e) => setLinkedCostCenterId(e.target.value)}
          disabled={disabled}
        >
          <option value="">—</option>
          {costCenterOptions}
        </select>
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function InvestmentForm({
  companyId,
  repository,
  disabled,
  onCreated,
}: FormBase) {
  const [name, setName] = useState('');
  const [instrumentType, setInstrumentType] = useState(
    instrumentOptions[0]!.value
  );
  const [openedAt, setOpenedAt] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      name: z.string().min(1),
      openedAt: z.string().min(1),
      principalAmount: z.coerce.number().positive(),
    });
    const parsed = schema.safeParse({
      name,
      openedAt,
      principalAmount,
    });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createInvestment(companyId, {
        name: parsed.data.name,
        instrumentType,
        openedAt: parsed.data.openedAt,
        principalAmount: parsed.data.principalAmount,
        currencyCode: DEFAULT_CURRENCY,
      });
      setName('');
      setOpenedAt('');
      setPrincipalAmount('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <label className="field-label">
        Nome
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
        <label className="field-label">
          Instrumento
          <select
            className="field-input"
            value={instrumentType}
            onChange={(e) => setInstrumentType(e.target.value)}
            disabled={disabled}
          >
            {instrumentOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Data de abertura
          <input
            className="field-input"
            type="date"
            value={openedAt}
            onChange={(e) => setOpenedAt(e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
      <label className="field-label">
        Principal (R$)
        <input
          className="field-input"
          type="number"
          min={0}
          step="0.01"
          value={principalAmount}
          onChange={(e) => setPrincipalAmount(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}

function BankLineForm({
  companyId,
  repository,
  disabled,
  onCreated,
}: FormBase) {
  const [bookedAt, setBookedAt] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMsg(null);
    const schema = z.object({
      bookedAt: z.string().min(1),
      amount: z.coerce.number(),
      description: z.string().min(1),
    });
    const parsed = schema.safeParse({ bookedAt, amount, description });
    if (!parsed.success) {
      setMsg({ type: 'err', text: UI_MESSAGES_PT_BR.invalidForm });
      return;
    }
    setPending(true);
    try {
      await repository.createBankStatementLine(companyId, {
        bookedAt: parsed.data.bookedAt,
        amount: parsed.data.amount,
        currencyCode: DEFAULT_CURRENCY,
        description: parsed.data.description,
      });
      setBookedAt('');
      setAmount('');
      setDescription('');
      setMsg({ type: 'ok', text: UI_MESSAGES_PT_BR.entriesSaved });
      onCreated();
    } catch (e: unknown) {
      setMsg({
        type: 'err',
        text: e instanceof Error ? e.message : UI_MESSAGES_PT_BR.loadFailed,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formGrid}>
      <p className={styles.formHint}>
        Use valor negativo para saída e positivo para entrada, alinhado ao
        extrato bancário.
      </p>
      <label className="field-label">
        Data do lançamento
        <input
          className="field-input"
          type="date"
          value={bookedAt}
          onChange={(e) => setBookedAt(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Valor (R$)
        <input
          className="field-input"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="field-label">
        Descrição (como no extrato)
        <input
          className="field-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
        />
      </label>
      <div className={styles.formActions}>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={disabled || pending}
        >
          {UI_MESSAGES_PT_BR.entriesSubmit}
        </Button>
        {msg?.type === 'ok' ? (
          <span className={styles.success}>{msg.text}</span>
        ) : null}
        {msg?.type === 'err' ? (
          <span className={styles.error}>{msg.text}</span>
        ) : null}
      </div>
    </div>
  );
}
