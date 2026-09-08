import type { AccountExterna, TransactionExterno } from '../../domain/model/external-account';
import type { ConexaoCriada, OpenFinanceAggregator } from '../../domain/port/driven/open-finance-aggregator';
import { eTransitorio, falha, type ResultDaAgregacao } from '../../domain/model/aggregation-result';

// Politica de resiliencia de RNF-006, como DECORADOR de qualquer aggregator.
//
// Se ela vivesse dentro do adaptador Pluggy, o adaptador falso nao a teria — e
// testar timeout exigiria rede. Aqui a mesma politica vale para Pluggy, para o
// falso e para qualquer provedor futuro, e e testavel com clock falso.

export interface PoliticaDeResiliencia {
  /** RNF-006: no maximo 10 s de espera por chamada. */
  readonly limiteEmMs: number;
  /** RNF-006: no maximo 2 NOVAS tentativas depois da primeira. */
  readonly novasTentativas: number;
  /** Espera antes de cada nova tentativa; dobra a cada uma. */
  readonly esperaBaseEmMs: number;
}

export const POLITICA_PADRAO: PoliticaDeResiliencia = {
  limiteEmMs: 10_000,
  novasTentativas: 2,
  esperaBaseEmMs: 200,
};

const dormir = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ResilientAggregator implements OpenFinanceAggregator {
  constructor(
    private readonly interno: OpenFinanceAggregator,
    private readonly politica: PoliticaDeResiliencia = POLITICA_PADRAO,
  ) {}

  listarAccounts(idDaConexao: string): Promise<ResultDaAgregacao<readonly AccountExterna[]>> {
    return this.comPolitica(() => this.interno.listarAccounts(idDaConexao));
  }

  criarConexao(instituicaoId: string): Promise<ResultDaAgregacao<ConexaoCriada>> {
    return this.comPolitica(() => this.interno.criarConexao(instituicaoId));
  }

  listarTransactions(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultDaAgregacao<readonly TransactionExterno[]>> {
    return this.comPolitica(() => this.interno.listarTransactions(idDaConexao, desde));
  }

  /**
   * Uma tentativa mais, no maximo, `novasTentativas`. So motivo transitorio e
   * repetido: insistir com credencial invalida nao conserta nada e ainda gasta
   * a cota do provedor.
   */
  private async comPolitica<T>(
    chamar: () => Promise<ResultDaAgregacao<T>>,
  ): Promise<ResultDaAgregacao<T>> {
    let ultima = falha('indisponivel', 'nenhuma tentativa executada');

    for (let tentativa = 0; tentativa <= this.politica.novasTentativas; tentativa += 1) {
      if (tentativa > 0) {
        // Espera crescente: 200 ms, 400 ms. Repetir de imediato contra um
        // provedor em sobrecarga so piora a sobrecarga.
        await dormir(this.politica.esperaBaseEmMs * 2 ** (tentativa - 1));
      }

      const resultado = await this.comLimiteDeEspera(chamar);
      if (resultado.tipo === 'ok') return resultado;

      ultima = resultado;
      if (!eTransitorio(resultado.motivo)) return resultado;
    }

    return ultima;
  }

  /**
   * Interrormpe a espera no limite. Note que a promessa do provedor continua
   * pendente por baixo — nao ha como cancelar uma Promise —, mas quem chamou
   * ja recebeu a falha e segue o fluxo. O adaptador HTTP passa o limite adiante
   * ao `fetch` por AbortSignal, e ai a conexao e de fato encerrada.
   */
  private async comLimiteDeEspera<T>(
    chamar: () => Promise<ResultDaAgregacao<T>>,
  ): Promise<ResultDaAgregacao<T>> {
    let expirar: ReturnType<typeof setTimeout> | undefined;

    const limite = new Promise<ResultDaAgregacao<T>>((resolve) => {
      expirar = setTimeout(
        () => resolve(falha('indisponivel', `provedor nao respondeu em ${this.politica.limiteEmMs} ms`)),
        this.politica.limiteEmMs,
      );
    });

    try {
      return await Promise.race([chamar(), limite]);
    } finally {
      if (expirar) clearTimeout(expirar);
    }
  }
}
