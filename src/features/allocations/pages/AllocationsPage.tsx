import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Text } from '@/components/ui/Text';
import { validateAllocationPercentages } from '@/domain/allocationMath';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { AllocationRule } from '@/types/domain';

export function AllocationsPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Regras de rateio"
        description="Percentuais validados por funções puras antes de qualquer persistência em planilha ou API."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <AllocationsBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type AllocationsBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function AllocationsBody({ repository, companyId }: AllocationsBodyProps) {
  const [rows, setRows] = useState<AllocationRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listAllocationRules(companyId)
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
    <div className="stack">
      {rows.map((rule) => {
        const validation = validateAllocationPercentages(rule.splits);
        return (
          <Card
            key={rule.id}
            title={rule.name}
            headerExtra={<Badge>{rule.traceabilityCode}</Badge>}
          >
            <Text variant="mono" as="p">
              ID da regra: {rule.id}
            </Text>
            <ul>
              {rule.splits.map((split) => (
                <li key={split.costCenterId}>
                  {split.costCenterId}: {split.percentage}%
                </li>
              ))}
            </ul>
            <p className={validation.ok ? 'text-success' : 'text-danger'}>
              {validation.ok ? 'Percentuais válidos (somam 100%)' : validation.reason}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
