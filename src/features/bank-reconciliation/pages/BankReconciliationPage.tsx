import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { BankStatementLine } from '@/types/domain';
import { formatBankLineStatusPt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function BankReconciliationPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Conciliação bancária"
        description="Linhas de extrato importadas com vínculo a lançamentos internos (base para regras automáticas depois)."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <BankLinesBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type BankLinesBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function BankLinesBody({ repository, companyId }: BankLinesBodyProps) {
  const [rows, setRows] = useState<BankStatementLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listBankStatementLines(companyId)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : UI_MESSAGES_PT_BR.loadFailed);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, companyId]);

  if (loading) return <p className="state-message">{UI_MESSAGES_PT_BR.loading}</p>;
  if (error) return <p className="state-message">{error}</p>;

  return (
    <div className="table-responsive">
    <table className="data-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th>Valor</th>
          <th>Lançamento vinculado</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.bookedAt}</td>
            <td>{row.description}</td>
            <td>{formatCurrency(row.amount, row.currencyCode, 'pt-BR')}</td>
            <td className="mono">{row.matchedTransactionId ?? '—'}</td>
            <td>{formatBankLineStatusPt(row.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
