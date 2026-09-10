import type { Page, Route } from '@playwright/test';

/**
 * Interceptador HTTP para testes funcionais do Playwright (ADR-003).
 *
 * Simula as respostas da API REST (@contacomigo/backend) em http://localhost:3000
 * permitindo que a suíte funcional de navegação real execute com isolamento total,
 * determinismo e velocidade (~100ms por teste vs 15s de timeout no CI), sem depender
 * de banco de dados pré-semeado ou de chaves de criptografia no CI.
 */
export async function setupMockApi(page: Page): Promise<void> {
  let hasActiveSession = false;

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
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              account: {
                id: 'demo-holder-id',
                email: 'demo@contacomigo.com',
              },
              accessToken: 'mock-valid-access-token',
              refreshToken: 'mock-valid-refresh-token',
              expiresAt: new Date(Date.now() + 3600_000).toISOString(),
            }),
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
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            account: {
              id: 'demo-holder-id',
              email: 'demo@contacomigo.com',
            },
            accessToken: 'mock-valid-access-token',
            refreshToken: 'mock-valid-refresh-token',
            expiresAt: new Date(Date.now() + 3600_000).toISOString(),
          }),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ mensagem: 'Sem sessão ativa' }),
      });
    }

    // 3. Perfil do Usuário (/access/accounts/me)
    if (path === '/access/accounts/me') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'demo-holder-id',
          email: 'demo@contacomigo.com',
          name: 'Usuário Demo',
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      });
    }

    // 4. Cadastro de Contas (/access/accounts)
    if (path === '/access/accounts') {
      if (method === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'novo-holder-id',
            email: 'novo@contacomigo.com',
            name: 'Novo Usuário',
          }),
        });
      }
    }

    // 5. Resumo do Dashboard (/dashboard/summary)
    if (path === '/dashboard/summary') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          saldoTotalEmCents: 1250000,
          receitasDoMesEmCents: 500000,
          despesasDoMesEmCents: 320000,
          investimentosEmCents: 850000,
          taxaPoupanca: 36,
        }),
      });
    }

    // 6. Transações (/transactions)
    if (path === '/transactions') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          estado: 'ok',
          dados: [
            {
              id: 'tx-1',
              description: 'Supermercado Central',
              amountInCents: 15000,
              category: 'alimentacao',
              date: '2026-09-01T12:00:00.000Z',
              type: 'DEBIT',
            },
            {
              id: 'tx-2',
              description: 'Salário Mensal',
              amountInCents: 500000,
              category: 'renda',
              date: '2026-09-05T08:00:00.000Z',
              type: 'CREDIT',
            },
          ],
        }),
      });
    }

    // 7. Semáforo Orçamentário (/budgets/semaphore)
    if (path.startsWith('/budgets/semaphore')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          faixa: 'verde',
          consumidoEmCents: 150000,
          limiteTotalEmCents: 500000,
          percentualConsumido: 30,
        }),
      });
    }

    // 8. Histórico e Diagnóstico de Orçamento
    if (path === '/budgets/history') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          meses: [{ mes: '2026-08', totalEmCentavos: 120000 }],
        }),
      });
    }

    if (path === '/budgets/diagnosis') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'estavel',
          mensagem: 'Seus gastos estão sob controle.',
        }),
      });
    }

    // 9. Conexões Bancárias Open Finance (/consents)
    if (path === '/consents') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'consent-demo-1',
            institutionId: 'Banco do Brasil',
            status: 'ativo',
            lastSyncAt: '2026-09-09T10:00:00.000Z',
          },
          {
            id: 'consent-demo-2',
            institutionId: 'Nubank',
            status: 'ativo',
            lastSyncAt: '2026-09-08T15:30:00.000Z',
          },
        ]),
      });
    }

    // 10. Exclusão de Conta (/consents/account)
    if (path === '/consents/account') {
      return route.fulfill({ status: 204, body: '' });
    }

    // 11. Consultor IA (/intelligence/chat)
    if (path === '/intelligence/chat') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          estado: 'ok',
          resposta: 'Com base nas suas transações de alimentação, você manteve os gastos dentro da média.',
          aviso:
            'O Consultor IA é educativo e usa seus números, mas não é aconselhamento financeiro. ' +
            'Não recomenda produtos, investimentos, crédito ou instituições. Consulte um profissional qualificado.',
        }),
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
