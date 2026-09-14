import { categorizarPorRegra, categoriaValida, type Categoria } from '../domain/model/category';
import type { Transaction } from '../domain/model/transaction';
import type { CategorySuggester } from '../domain/port/driven/category-suggester';

// RF-011 no mesmo desenho de HN-004: regra deterministica primeiro, IA em UM
// lote para o que sobrou, e estado explicito quando ninguem sabe.
//
// RN-011 aparece logo na entrada: lancamento com categoria manual nao e
// reclassificado nem entra no lote — perguntar sobre ele custaria cota para
// produzir uma resposta que seria descartada.
const LOTE_PADRAO = 30;

export class CategorizeTransactions {
  constructor(
    private readonly sugeridor: CategorySuggester,
    private readonly tamanhoDoLote = LOTE_PADRAO,
  ) {}

  async executar(lancamentos: readonly Transaction[]): Promise<readonly Transaction[]> {
    const automaticas = new Map<string, Categoria | null>();
    for (const lancamento of lancamentos) {
      if (lancamento.categoryOrigin === 'manual') continue;
      const chave = this.chaveDe(lancamento);
      if (!automaticas.has(chave)) {
        automaticas.set(chave, categorizarPorRegra(chave, lancamento.amountInCents));
      }
    }

    const pendentes = [...automaticas.entries()]
      .filter(([, categoria]) => categoria === null)
      .map(([descricao]) => descricao)
      .slice(0, this.tamanhoDoLote);

    const holder = lancamentos[0]?.holderId ?? '';
    const sugeridas = pendentes.length > 0 ? await this.sugerirComSeguranca(pendentes, holder) : {};

    return lancamentos.map((lancamento) => {
      if (lancamento.categoryOrigin === 'manual') return lancamento;

      const chave = this.chaveDe(lancamento);
      const sugerida = sugeridas[chave];
      const categoria = automaticas.get(chave) ?? (categoriaValida(sugerida) ? sugerida : null);

      return { ...lancamento, category: categoria, categoryOrigin: categoria === null ? null : 'automatica' };
    });
  }

  // A classificacao usa a descricao LEGIVEL de HN-004: "Mercado Central" tem
  // termo reconhecivel; "PAG*MERCADO CENTRAL 04/12" atrapalharia a regra.
  private chaveDe(lancamento: Transaction): string {
    return lancamento.readableDescription ?? lancamento.description;
  }

  /** Provedor fora nao derruba a sincronizacao: fica nao classificado (RN-021). */
  private async sugerirComSeguranca(pendentes: readonly string[], holder: string): Promise<Record<string, string>> {
    try {
      return await this.sugeridor.sugerir(pendentes, holder);
    } catch {
      return {};
    }
  }
}
