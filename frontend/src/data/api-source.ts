import { ok, type ConnectedBankDTO, type ConsolidatedSummaryDTO, type Result, type SpendingCategoryDTO, type TransactionDTO } from '@contacomigo/contract';
import { getAccessToken } from './access';

// API source (HN-003 integration): the real backend behind the DataSource port.
// The web talks to the NestJS API with the access token; synthetic data comes
// from the aggregator (Fake or Pluggy Sandbox). Replacing FakeSource with this
// never touches the components — that is what the equivalence test proves.

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function autorizado(): Record<string, string> {
  const token = getAccessToken();
  if (!token) throw new Error('Sem sessao: faca login para obter os dados.');
  return { authorization: `Bearer ${token}` };
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
    // Consent -> connected bank: the bank connected in the PoC is the institution
    // the person authorized. Status comes from the consent.
    return ok(
      consents.map((c) => ({
        id: c.id,
        name: c.institutionId,
        saldoEmCents: 0,
        status: c.status === 'ativo' ? ('ativo' as const) : ('error' as const),
        ultimaSincronizacao: c.lastSyncAt,
      })),
    );
  }

  async listarCategoriasDeGasto(): Promise<Result<SpendingCategoryDTO[]>> {
    // The backend does not expose spending categories yet (HN-005); the chart
    // keeps its mock source. This source returns empty so the screen degrades
    // gracefully instead of breaking.
    return ok([]);
  }

  async resumoConsolidado(): Promise<Result<ConsolidatedSummaryDTO>> {
    const response = await fetch(`${BASE}/dashboard/summary`, { headers: autorizado() });
    if (!response.ok) return { estado: 'error', codigo: 'interno', mensagem: 'Falha ao buscar o resumo.' };
    return { estado: 'ok', dados: (await response.json()) as ConsolidatedSummaryDTO };
  }
}