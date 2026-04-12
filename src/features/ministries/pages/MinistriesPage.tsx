import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { Ministry } from '@/types/domain';

export function MinistriesPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Gestão de ministérios"
        description="Ministérios com líderes, membros e vínculo opcional a centro de custo."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <MinistriesBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type MinistriesBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function MinistriesBody({ repository, companyId }: MinistriesBodyProps) {
  const [rows, setRows] = useState<Ministry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listMinistries(companyId)
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
          <th>Nome</th>
          <th>Líder (ID)</th>
          <th>Centro de custo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td className="mono">{row.leaderUserId ?? '—'}</td>
            <td className="mono">{row.linkedCostCenterId ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
