import { useCompanyContext } from '@/context/CompanyContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';

export function CompaniesPage() {
  const { allowedCompanies } = useCompanyContext();

  return (
    <section className="page">
      <PageHeader
        title="Empresas"
        description="Organização cadastrada na plataforma."
      />
      {allowedCompanies.length === 0 ? (
        <p className="state-message">{UI_MESSAGES_PT_BR.noCompaniesAssigned}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>ID da empresa</th>
              <th>Criada em</th>
            </tr>
          </thead>
          <tbody>
            {allowedCompanies.map((company) => (
              <tr key={company.id}>
                <td>{company.name}</td>
                <td className="mono">{company.id}</td>
                <td>{company.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
