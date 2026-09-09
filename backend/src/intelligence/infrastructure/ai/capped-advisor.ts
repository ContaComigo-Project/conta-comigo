import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import { falhaDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import { dentroDoTeto, diaDe, TETO_DIARIO_PADRAO } from '../../domain/model/daily-quota';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import type { Clock } from '../../domain/port/driven/clock';
import type { UsageCounter } from '../../domain/port/driven/usage-counter';

// RNF-009: o uso de IA cabe no free tier.
//
// O teto e verificado ANTES de qualquer chamada, e o uso so e contado quando o
// provedor de fato respondeu: cobrar cota por uma falha puniria a pessoa por um
// problema que nao e dela.
//
// A recusa e resultado, nao excecao — a tela mostra o aviso e segue mostrando
// os numeros (RN-021).
export class CappedAdvisor implements AiAdvisor {
  constructor(
    private readonly interno: AiAdvisor,
    private readonly contador: UsageCounter,
    private readonly clock: Clock,
    private readonly teto: number = TETO_DIARIO_PADRAO,
  ) {}

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    const dia = diaDe(this.clock.agora());
    const uso = await this.contador.usoDoDia(pedido.holder, dia);

    if (!dentroDoTeto(uso, this.teto)) {
      return falhaDeIa(
        'teto-atingido',
        `Você atingiu o limite de ${this.teto} análises de IA por dia. Ele volta a zero amanhã; os números do painel continuam disponíveis.`,
      );
    }

    const resultado = await this.interno.aconselhar(pedido);
    if (resultado.tipo === 'ok') await this.contador.registrarUso(pedido.holder, dia);

    return resultado;
  }
}
