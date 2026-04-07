import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { AuditLog } from '@/types/domain';

export function AuditLogPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Auditoria"
        description="Trilha de eventos: quem fez o quê, em qual entidade e quando."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <AuditBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type AuditBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function AuditBody({ repository, companyId }: AuditBodyProps) {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listAuditLogs(companyId)
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
    <table className="data-table">
      <thead>
        <tr>
          <th>Quando</th>
          <th>Usuário (ID)</th>
          <th>Ação</th>
          <th>Entidade</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.occurredAt}</td>
            <td className="mono">{row.actorUserId}</td>
            <td>{row.action}</td>
            <td>
              {row.entityType}:{row.entityId}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
