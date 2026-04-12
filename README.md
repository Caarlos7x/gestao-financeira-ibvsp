# Gestão Financeira — IBVSP

Aplicação web de **gestão financeira** pensada para apoiar a organização **Igreja Batista — Vila São Pedro (IBVSP)** no acompanhamento de orçamentos, lançamentos, contas a pagar, relatórios e indicadores.

## Ação social

Este projeto nasce como **ação social**: voluntários e colaboradores desenvolvem e mantêm a solução **sem fins lucrativos**, com o objetivo de **fortalecer a transparência e a boa gestão dos recursos** da comunidade. A tecnologia aqui serve ao propósito de apoiar o trabalho social e ministerial da igreja, não como produto comercial.

## Funcionalidades (visão geral)

- **Painel** com métricas, gráficos de movimentações (receitas/despesas por mês, distribuição e centros de custo) e resumo operacional.
- **Lançamentos** centralizados (movimentos financeiros, contas a pagar, fornecedores, despesas da igreja, orçamentos, ativos, ministérios, investimentos, extrato, rateios, etc.).
- **Relatório geral (igreja)** com filtros e exportação (Excel/PDF).
- **Configurações** com preferências de alertas e farol financeiro (persistência local no navegador).
- Autenticação com **Firebase**; em desenvolvimento ou em deploy de **demonstração** é possível pular o login (veja `.env.example` e seção **Deploy na Vercel** abaixo).

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

- **`VITE_FIREBASE_*`**: necessárias para login real com Firebase em produção.
- **`VITE_DEV_SKIP_AUTH`**: em `pnpm dev`, use `false` se quiser testar o login Firebase localmente.
- **`VITE_DEMO_SKIP_AUTH`**: em **build de produção** (ex.: Vercel), `true` entra direto como o perfil seed **`admin@sistema.test`** (mock), **sem** Firebase. Qualquer pessoa com o link acessa — use **somente** para demonstração e desligue quando for usar dados reais.
- **`VITE_ENABLE_LOCAL_TEST_LOGIN`**: só com `pnpm dev`, use `true` **e** `VITE_DEV_SKIP_AUTH=false` para entrar pela **tela de login** com usuários definidos em **`src/config/localTestAuth.ts`** (sem Firebase).

Nunca commite arquivo `.env` com segredos.

O repositório inclui **`vercel.json`** com rewrite para `index.html`, para rotas como `/login` não retornarem 404 ao atualizar a página.

## Deploy na Vercel (demonstração rápida)

1. No projeto na Vercel: **Settings → Environment Variables**, adicione **`VITE_DEMO_SKIP_AUTH`** = **`true`** (Production e/ou Preview).
2. **Não** é obrigatório preencher `VITE_FIREBASE_*` para essa demo (o app ignora Firebase quando a demo está ativa).
3. Gere um novo deploy. Ao abrir o site, você já estará autenticado como admin (perfil do mock).

Para **produção com login real**: remova ou defina `VITE_DEMO_SKIP_AUTH` como `false`, preencha todas as `VITE_FIREBASE_*`, adicione o domínio da Vercel em **Firebase → Authentication → Authorized domains** e crie os usuários (ex.: `admin@sistema.test`) no console do Firebase com a senha que você escolher.

### Conta `admin@sistema.test` no Firebase

O código **não** cria usuário nem guarda senha. No [Firebase Console](https://console.firebase.google.com/) → Authentication → Users → **Add user**: e-mail `admin@sistema.test` e uma **senha forte** definida por você (guarde em um gerenciador de senhas). Repita para `operador@sistema.test` se precisar.

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
