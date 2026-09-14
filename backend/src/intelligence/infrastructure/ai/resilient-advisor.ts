import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import { eTransitoriaNaIa, falhaDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';

// RNF-006 (limite de espera e nova tentativa controlada) como decorador, pelo
// mesmo motivo de HT-011: dentro do adaptador real, o falso nao teria a
// politica, e testar timeout exigiria rede.

export interface PoliticaDeIa {
  /** RNF-006: no maximo 10 s de espera por chamada. */
  readonly limiteEmMs: number;
  /** RNF-006: no maximo 2 NOVAS tentativas depois da primeira. */
  readonly novasTentativas: number;
  /** Espera antes de cada nova tentativa; dobra a cada uma. */
  readonly esperaBaseEmMs: number;
}

export const POLITICA_DE_IA_PADRAO: PoliticaDeIa = {
  limiteEmMs: 10_000,
  novasTentativas: 2,
  esperaBaseEmMs: 200,
};

const dormir = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ResilientAdvisor implements AiAdvisor {
  constructor(
    private readonly interno: AiAdvisor,
    private readonly politica: PoliticaDeIa = POLITICA_DE_IA_PADRAO,
  ) {}

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    let ultima = falhaDeIa('indisponivel', 'nenhuma tentativa executada');

    for (let tentativa = 0; tentativa <= this.politica.novasTentativas; tentativa += 1) {
      if (tentativa > 0) await dormir(this.politica.esperaBaseEmMs * 2 ** (tentativa - 1));

      const resultado = await this.comLimiteDeEspera(pedido);
      if (resultado.tipo === 'ok') return resultado;

      ultima = resultado;
      // Chave invalida nao melhora na terceira tentativa; so gasta cota.
      if (!eTransitoriaNaIa(resultado.motivo)) return resultado;
    }

    return ultima;
  }

  /**
   * Interrompe a espera no limite. A promessa do provedor segue pendente por
   * baixo — nao ha como cancelar uma Promise —, mas quem chamou ja recebeu a
   * falha. O adaptador HTTP repassa o limite ao fetch por AbortSignal, e ai a
   * conexao e de fato encerrada.
   *
   * A excecao do adaptador tambem vira falha aqui: nenhum throw pode atravessar
   * a porta e esvaziar a tela (RN-021).
   */
  private async comLimiteDeEspera(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    let expirar: ReturnType<typeof setTimeout> | undefined;

    const limite = new Promise<ResultadoDeIa<Conselho>>((resolve) => {
      expirar = setTimeout(
        () => resolve(falhaDeIa('indisponivel', `provedor de IA nao respondeu em ${this.politica.limiteEmMs} ms`)),
        this.politica.limiteEmMs,
      );
    });

    try {
      return await Promise.race([this.interno.aconselhar(pedido), limite]);
    } catch (erro) {
      return falhaDeIa('indisponivel', erro instanceof Error ? erro.message : 'falha desconhecida no provedor');
    } finally {
      if (expirar) clearTimeout(expirar);
    }
  }
}
