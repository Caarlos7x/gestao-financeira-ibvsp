# Gestão Financeira — IBVSP

Aplicação web de **gestão financeira** pensada para apoiar a organização **Igreja Batista — Vila São Pedro (IBVSP)** no acompanhamento de orçamentos, lançamentos, contas a pagar, relatórios e indicadores.

## Ação social

Este projeto nasce como **ação social**: voluntários e colaboradores desenvolvem e mantêm a solução **sem fins lucrativos**, com o objetivo de **fortalecer a transparência e a boa gestão dos recursos** da comunidade. A tecnologia aqui serve ao propósito de apoiar o trabalho social e ministerial da igreja, não como produto comercial.

## Funcionalidades (visão geral)

- **Painel** com métricas, gráficos de movimentações (receitas/despesas por mês, distribuição e centros de custo) e resumo operacional.
- **Lançamentos** centralizados (movimentos financeiros, contas a pagar, fornecedores, despesas da igreja, orçamentos, ativos, ministérios, investimentos, extrato, rateios, etc.).
- **Relatório geral (igreja)** com filtros e exportação (Excel/PDF).
- **Configurações** com preferências de alertas e farol financeiro (persistência local no navegador).
- Autenticação preparada para **Firebase**; em desenvolvimento é possível usar bypass de login (veja `.env.example`).

Os dados de demonstração usam um **repositório mock** em memória (sessão), com contratos prontos para evoluir para planilhas (Google Apps Script), API ou banco.

## Stack

- **React 19** + **TypeScript**
- **Vite**
- **React Router**
- **Firebase** (Auth)
- **Zod** (validação)
- **Recharts** (gráficos no painel)
- **Vitest** + **ESLint**

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm` ou via Corepack)

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra o endereço exibido no terminal (em geral `http://localhost:5173`).

### Scripts

| Comando        | Descrição              |
| -------------- | ---------------------- |
| `pnpm dev`     | Servidor de desenvolvimento |
| `pnpm build`   | Build de produção      |
| `pnpm preview` | Preview do build       |
| `pnpm test`    | Testes (Vitest)        |
| `pnpm lint`    | ESLint                 |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha conforme necessário:

- **`VITE_FIREBASE_*`**: necessárias para login real com Firebase.
- **`VITE_DEV_SKIP_AUTH`**: em `pnpm dev`, por padrão o login pode ser ignorado para agilizar (detalhes no `.env.example`).

Nunca commite arquivo `.env` com segredos.

## Estrutura (resumo)

- `src/app` — roteador e providers
- `src/features` — páginas por domínio (dashboard, lançamentos, relatórios, etc.)
- `src/domain` — regras de negócio puras e testes
- `src/services` — Firebase, repositórios, integrações
- `src/theme` — tokens globais e estilos base

## Contribuindo

Contribuições alinhadas à **ação social** do projeto são bem-vindas: melhorias de acessibilidade, testes, documentação e funcionalidades que ajudem a igreja a gerir melhor seus recursos.

## Licença

Uso interno e comunitário conforme acordo da organização. Ajuste esta seção se adotar uma licença open source explícita.
