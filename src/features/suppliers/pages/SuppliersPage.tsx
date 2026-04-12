import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { Supplier } from '@/types/domain';

export function SuppliersPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Fornecedores"
        description="Cadastro mestre de fornecedores por empresa."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <SuppliersBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type SuppliersBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function SuppliersBody({ repository, companyId }: SuppliersBodyProps) {
  const [rows, setRows] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listSuppliers(companyId)
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
          <th>CNPJ / documento</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.taxId ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
