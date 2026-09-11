import type { Page, Route } from '@playwright/test';
import {
  AccountProfileDTO,
  BudgetHistoryDTO,
  BudgetSemaphoreDTO,
  ChatRespostaDTO,
  ConsolidatedSummaryDTO,
  ConsentDTO,
  DiagnosisDTO,
  SessionDTO,
  resultadoDe,
  TransactionDTO,
} from '@contacomigo/contract';

/**
 * Interceptador HTTP para testes funcionais do Playwright (ADR-003).
 *
 * Simula as respostas da API REST (@contacomigo/backend) em http://localhost:3000
 * permitindo que a suíte funcional de navegação real execute com isolamento total,
 * determinismo e velocidade, sem depender de banco pré-semeado ou de chaves de
 * criptografia no CI.
 *
 * As respostas seguem o CONTRATO REAL (HT-017/HT-020): cada payload é validado
 * com o DTO correspondente do `@contacomigo/contract` antes de ser devolvido —
 * se o mock divergir do contrato, o teste falha em vez de passar com dado errado.
 */
export async function setupMockApi(page: Page): Promise<void> {
  let hasActiveSession = false;

  const cumprir = (route: Route, dto: { safeParse: (dados: unknown) => { success: boolean; data?: unknown } }, dados: unknown) => {
    const parsed = dto.safeParse(dados);
    if (!parsed.success) {
      throw new Error(`[mock-api] resposta fora do contrato: ${JSON.stringify(dados)}`);
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(parsed.data),
    });
  };

  await page.route(/http:\/\/localhost:3000\/.*/, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    // 1. Autenticação e Sessão (/access/sessions)
    if (path === '/access/sessions') {
      if (method === 'POST') {
        const body = (request.postDataJSON() || {}) as { email?: string; senha?: string };
        if (body.email === 'demo@contacomigo.com' && body.senha === 'demo123') {
          hasActiveSession = true;
          return cumprir(route, SessionDTO, {
            account: { id: 'demo-holder-id', email: 'demo@contacomigo.com' },
            accessToken: 'mock-valid-access-token',
            refreshToken: 'mock-valid-refresh-token',
            expiresAt: new Date(Date.now() + 3600_000).toISOString(),
          });
        }
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ mensagem: 'E-mail ou senha inválidos.' }),
        });
      }

      if (method === 'DELETE') {
        hasActiveSession = false;
        return route.fulfill({ status: 204, body: '' });
      }
    }

    // 2. Renovação de Sessão (/access/sessions/refresh)
    if (path === '/access/sessions/refresh') {
      if (hasActiveSession) {
        return cumprir(route, SessionDTO, {
          account: { id: 'demo-holder-id', email: 'demo@contacomigo.com' },
          accessToken: 'mock-valid-access-token',
          refreshToken: 'mock-valid-refresh-token',
          expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ mensagem: 'Sem sessão ativa' }),
      });
    }

    // 3. Perfil do Usuário (/access/accounts/me) — AccountProfileDTO é strict:
    // campos extras (ex.: createdAt) fazem o safeParse falhar.
    if (path === '/access/accounts/me') {
      return cumprir(route, AccountProfileDTO, {
        id: 'demo-holder-id',
        email: 'demo@contacomigo.com',
        name: 'Usuário Demo',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    }

    // 4. Cadastro de Contas (/access/accounts)
    if (path === '/access/accounts') {
      if (method === 'POST') {
        return cumprir(route, AccountProfileDTO, {
          id: 'novo-holder-id',
          email: 'novo@contacomigo.com',
          name: 'Novo Usuário',
          createdAt: '2026-01-01T00:00:00.000Z',
        });
      }
    }

    // 5. Resumo do Dashboard (/dashboard/summary)
    if (path === '/dashboard/summary') {
      return cumprir(route, ConsolidatedSummaryDTO, {
        mes: { ano: 2026, mes: 9 },
        saldoTotalEmCentavos: 1250000,
        faturaDoCartaoEmCentavos: -87450,
        gastosDoMesEmCentavos: 320000,
        receitasDoMesEmCentavos: 500000,
        quantidadeDeLancamentos: 12,
      });
    }

    // 6. Transações (/transactions) — envelope Result<TransactionDTO[]>
    if (path === '/transactions') {
      const dados = resultadoDe(TransactionDTO.array()).safeParse({
        estado: 'ok',
        dados: [
          {
            id: 'tx-1',
            description: 'Supermercado Central',
            descriptionOriginal: 'PAG*MERCADO CENTRAL',
            estabelecimento: 'Supermercado Central',
            category: { id: 'alimentacao', name: 'Alimentação' },
            instituicao: { id: 'banco-exemplo', name: 'Banco Exemplo' },
            amountInCents: -15000,
            tipo: 'debito',
            dueDate: '2026-09-01T12:00:00-03:00',
          },
          {
            id: 'tx-2',
            description: 'Salário Mensal',
            category: { id: 'receita', name: 'Receita' },
            instituicao: { id: 'banco-exemplo', name: 'Banco Exemplo' },
            amountInCents: 500000,
            tipo: 'credito',
            dueDate: '2026-09-05T08:00:00-03:00',
          },
        ],
      });
      if (!dados.success) throw new Error('[mock-api] /transactions fora do contrato');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dados.data),
      });
    }

    // 7. Semáforo Orçamentário (/budgets/semaphore?month=)
    if (path.startsWith('/budgets/semaphore')) {
      return cumprir(route, BudgetSemaphoreDTO, {
        month: '2026-09',
        categorias: [
          { category: 'alimentacao', limitInCents: 150000, spentInCents: 120000, percentage: 80, band: 'amarela' },
          { category: 'transporte', limitInCents: 80000, spentInCents: 45000, percentage: 56.25, band: 'verde' },
          { category: 'moradia', limitInCents: 320000, spentInCents: 233100, percentage: 72.8, band: 'amarela' },
          { category: 'saude', limitInCents: 70000, spentInCents: 30000, percentage: 42.9, band: 'verde' },
          { category: 'lazer', limitInCents: 60000, spentInCents: 14000, percentage: 23.3, band: 'verde' },
          { category: 'outros', limitInCents: 100000, spentInCents: 20000, percentage: 20, band: 'verde' },
          { category: 'receita', limitInCents: 900000, spentInCents: 0, percentage: 0, band: 'verde' },
          { category: 'investimentos', limitInCents: 150000, spentInCents: 0, percentage: 0, band: 'verde' },
        ],
        alertas: [],
      });
    }

    // 8. Histórico e Diagnóstico de Orçamento
    if (path === '/budgets/history') {
      return cumprir(route, BudgetHistoryDTO, {
        meses: [
          {
            month: '2026-08',
            categorias: [
              { category: 'alimentacao', limitInCents: 150000, spentInCents: 137821, band: 'vermelha' },
              { category: 'moradia', limitInCents: 320000, spentInCents: 233100, band: 'amarela' },
            ],
          },
        ],
        problemas: [{ category: 'alimentacao', vezesEmVermelho: 2, excessoTotalEmCentavos: 13035 }],
      });
    }

    if (path === '/budgets/diagnosis') {
      return cumprir(route, DiagnosisDTO, {
        estado: 'ok',
        texto: 'Seus gastos estão sob controle: a maior parte do orçamento seguiu o padrão dos meses anteriores.',
      });
    }

    // 9. Conexões Bancárias Open Finance (/consents) — ConsentDTO[] (strict)
    if (path === '/consents') {
      const dados = ConsentDTO.array().safeParse([
        {
          id: 'consent-demo-1',
          institutionId: 'Banco do Brasil',
          scope: 'accounts-and-transactions',
          status: 'ativo',
          createdAt: '2026-09-01T10:00:00.000Z',
          expiresAt: '2026-12-01T10:00:00.000Z',
          lastSyncAt: '2026-09-09T10:00:00.000Z',
        },
        {
          id: 'consent-demo-2',
          institutionId: 'Nubank',
          scope: 'accounts-and-transactions',
          status: 'ativo',
          createdAt: '2026-09-01T10:00:00.000Z',
          expiresAt: '2026-12-01T10:00:00.000Z',
          lastSyncAt: '2026-09-08T15:30:00.000Z',
        },
      ]);
      if (!dados.success) throw new Error('[mock-api] /consents fora do contrato');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dados.data),
      });
    }

    // 10. Exclusão de Conta (/consents/account) e sincronização
    if (path === '/consents/account') {
      return route.fulfill({ status: 204, body: '' });
    }
    if (path.endsWith('/sync')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ consentId: 'consent-demo-1', contas: 1, lancamentos: 4 }),
      });
    }

    // 11. Consultor IA (/intelligence/chat) — ChatRespostaDTO
    if (path === '/intelligence/chat') {
      return cumprir(route, ChatRespostaDTO, {
        estado: 'ok',
        resposta: 'Com base nas suas transações de alimentação, você manteve os gastos dentro da média.',
        aviso:
          'O Consultor IA é educativo e usa seus números, mas não é aconselhamento financeiro. ' +
          'Não recomenda produtos, investimentos, crédito ou instituições. Consulte um profissional qualificado.',
      });
    }

    // Rota padrão vazia segura para chamadas secundárias
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}