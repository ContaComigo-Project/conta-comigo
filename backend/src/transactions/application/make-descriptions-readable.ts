import type { Transaction } from '../domain/model/transaction';
import { limparDescricao, precisaDeAjuda } from '../domain/model/readable-description';
import type { DescriptionTranslator } from '../domain/port/driven/description-translator';

// RF-010 em duas camadas, nesta ordem: regra deterministica primeiro, IA so
// para o que sobrou — e em UM lote, nao um pedido por lancamento. Uma conta com
// 300 lancamentos nao pode virar 300 chamadas com teto diario de 20 (RNF-009).
//
// O original nunca e tocado (RN-010): `description` continua como veio, e o
// resultado vai para `readableDescription`.
const LOTE_PADRAO = 30;

export class MakeDescriptionsReadable {
  constructor(
    private readonly tradutor: DescriptionTranslator,
    private readonly tamanhoDoLote = LOTE_PADRAO,
  ) {}

  async executar(lancamentos: readonly Transaction[]): Promise<readonly Transaction[]> {
    const deterministicas = new Map<string, string>();
    for (const lancamento of lancamentos) {
      if (!deterministicas.has(lancamento.description)) {
        deterministicas.set(lancamento.description, limparDescricao(lancamento.description));
      }
    }

    // Descricao repetida entra uma vez so: pagar duas vezes pelo mesmo texto e
    // exatamente o que RNF-010 evita.
    const pendentes = [...deterministicas.entries()]
      .filter(([, limpa]) => precisaDeAjuda(limpa))
      .map(([original]) => original)
      .slice(0, this.tamanhoDoLote);

    const holder = lancamentos[0]?.holderId ?? '';
    const traduzidas = pendentes.length > 0 ? await this.traduzirComSeguranca(pendentes, holder) : {};

    return lancamentos.map((lancamento) => ({
      ...lancamento,
      readableDescription:
        traduzidas[lancamento.description] ??
        deterministicas.get(lancamento.description) ??
        lancamento.description,
    }));
  }

  /**
   * Falha do tradutor nao pode derrubar a sincronizacao (RNF-005, RN-021): sem
   * traducao, cada lancamento fica com a versao deterministica — e, se nem essa
   * reconheceu, com o proprio original (RN-010).
   */
  private async traduzirComSeguranca(
    pendentes: readonly string[],
    holder: string,
  ): Promise<Record<string, string>> {
    try {
      return await this.tradutor.traduzir(pendentes, holder);
    } catch {
      return {};
    }
  }
}
