import { ok, type BudgetHistoryDTO, type BudgetSemaphoreDTO, type ChatRespostaDTO, type ConnectedBankDTO, type ConsolidatedSummaryDTO, type DiagnosisDTO, type PerguntaChatDTO, type Result, type ResultadoSimulacaoDTO, type SimulacaoDTO, type SpendingCategoryDTO, type TransactionDTO } from '@contacomigo/contract';
import { getAccessToken } from './access';

// API source (HT-017 + HT-018): the real backend behind the DataSource port.
// The web talks to the NestJS API with the access token; every decision about
// bands, ranking and diagnosis comes ready from the backend (RN-001, RN-019).
// The frontend keeps only presentation, never the business rule.

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function autorizado(): Record<string, string> {
  const token = getAccessToken();
  if (!token) throw new Error('Sem sessao: faca login para obter os dados.');
  return { authorization: `Bearer ${token}` };
}

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

/** "AAAA-MM" do mês corrente no fuso de São Paulo — só para seleção de mês na UI. */
export function mesCorrente(agora: Date = new Date()): string {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric' }).formatToParts(agora);
  const ano = p.find((x) => x.type === 'year')?.value ?? '2026';
  const mes = p.find((x) => x.type === 'month')?.value ?? '1';
  return `${ano}-${mes.padStart(2, '0')}`;
}

export class ApiSource {
  async listarTransactions(): Promise<Result<TransactionDTO[]>> {
    const response = await fetch(`${BASE}/transactions`, { headers: autorizado() });
    if (!response.ok) return { estado: 'error', codigo: 'interno', mensagem: 'Falha ao listar transações.' };
    return (await response.json()) as Result<TransactionDTO[]>;
  }

  /**
   * HN-005 (RF-012): corrige a categoria de um lançamento. A partir daqui ela é
   * manual e a sincronização não a sobrescreve (RN-011).
   */
  async corrigirCategoria(transactionId: string, category: string): Promise<Result<{ id: string }>> {
    const response = await fetch(`${BASE}/transactions/${transactionId}/category`, {
      method: 'PATCH',
      headers: { ...autorizado(), 'content-type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    if (!response.ok) {
      return { estado: 'error', codigo: 'interno', mensagem: 'Não foi possível salvar a categoria.' };
    }
    return (await response.json()) as Result<{ id: string }>;
  }

  async listarBancosConectados(): Promise<Result<ConnectedBankDTO[]>> {
    const response = await fetch(`${BASE}/consents`, { headers: autorizado() });
    if (!response.ok) return { estado: 'error', codigo: 'interno', mensagem: 'Falha ao listar conexões.' };
    const consents = (await response.json()) as Array<{
      id: string;
      institutionId: string;
      status: string;
      lastSyncAt: string | null;
    }>;
    // RN-012: Sem consentimento ativo não há exibição nem sincronização.
    // Conexões revogadas ou expiradas não aparecem como bancos conectados no painel.
    const ativos = consents.filter((c) => c.status === 'ativo');
    return ok(
      ativos.map((c) => ({
        id: c.id,
        name: c.institutionId,
        saldoEmCents: 0,
        status: 'ativo' as const,
        ultimaSincronizacao: c.lastSyncAt,
      })),
    );
  }

  async listarCategoriasDeGasto(): Promise<Result<SpendingCategoryDTO[]>> {
    // The backend does not expose spending categories yet (HN-005); the chart
    // degrades gracefully until HT-018 part 2 provides the endpoint.
    return ok([]);
  }

  async resumoConsolidado(): Promise<Result<ConsolidatedSummaryDTO>> {
    const response = await fetch(`${BASE}/dashboard/summary`, { headers: autorizado() });
    if (!response.ok) return { estado: 'error', codigo: 'interno', mensagem: 'Falha ao buscar o resumo.' };
    return { estado: 'ok', dados: (await response.json()) as ConsolidatedSummaryDTO };
  }

  // ---- HT-018: orçamento, IA e exportações contra o backend real ----

  async semaphoreDoMes(month: string): Promise<BudgetSemaphoreDTO> {
    return json(await fetch(`${BASE}/budgets/semaphore?month=${month}`, { headers: autorizado() }));
  }

  async historico(): Promise<BudgetHistoryDTO> {
    return json(await fetch(`${BASE}/budgets/history`, { headers: autorizado() }));
  }

  async diagnostico(): Promise<DiagnosisDTO> {
    return json(await fetch(`${BASE}/budgets/diagnosis`, { headers: autorizado() }));
  }

  async perguntarNoChat(pergunta: string): Promise<ChatRespostaDTO> {
    const body: PerguntaChatDTO = { pergunta };
    return json(
      await fetch(`${BASE}/intelligence/chat`, {
        method: 'POST',
        headers: { ...autorizado(), 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  }

  async simularCompra(categoria: string, valorEmCentavos: number, month?: string): Promise<ResultadoSimulacaoDTO> {
    const body: SimulacaoDTO = month ? { categoria, valorEmCentavos, month } : { categoria, valorEmCentavos };
    return json(
      await fetch(`${BASE}/budgets/simulation`, {
        method: 'POST',
        headers: { ...autorizado(), 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  }

  private async baixar(endpoint: string, nome: string): Promise<void> {
    const response = await fetch(`${BASE}${endpoint}`, { headers: autorizado() });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  }

  async baixarCSV(): Promise<void> {
    await this.baixar('/transactions/export.csv', 'lancamentos.csv');
  }

  async baixarPDF(month?: string): Promise<void> {
    const q = month ? `?month=${month}` : '';
    await this.baixar(`/budgets/report.pdf${q}`, 'relatorio-orcamento.pdf');
  }

  async limitesDoMes(month: string): Promise<Result<Array<{ category: string; limitInCents: number }>>> {
    return json(await fetch(`${BASE}/budgets/${month}`, { headers: autorizado() }));
  }

  async definirLimite(month: string, category: string, limiteEmCents: number): Promise<Result<{ category: string; limitInCents: number }>> {
    return json(
      await fetch(`${BASE}/budgets/${month}/${encodeURIComponent(category)}`, {
        method: 'PUT',
        headers: { ...autorizado(), 'content-type': 'application/json' },
        body: JSON.stringify({ limiteEmCents }),
      }),
    );
  }

  async removerLimite(month: string, category: string): Promise<void> {
    const response = await fetch(`${BASE}/budgets/${month}/${encodeURIComponent(category)}`, {
      method: 'DELETE',
      headers: autorizado(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }
}