import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import { okDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';

// Adaptador falso (ADR-001: "todo adaptador externo nasce com uma implementacao
// falsa para teste"). Deterministico e sem rede: o ambiente local sobe sem
// GEMINI_API_KEY e sem cadastro em provedor.
//
// O texto e generico de proposito. Ele NAO cita valor: numero exibido como dado
// financeiro vem do consolidado, nunca do modelo (RN-019) — e um falso que
// inventasse numeros ensinaria o time a confiar neles.
const RESPOSTAS: Record<PedidoDeConselho['tipo'], string> = {
  'diagnostico-do-mes':
    'Este e um diagnostico simulado: o mes seguiu o padrao dos anteriores, com a maior parte do gasto concentrada em poucas categorias.',
  'descricao-legivel': 'Compra em estabelecimento comercial',
  categoria: 'mercado',
  'pergunta-livre':
    'Esta e uma resposta simulada, apenas educativa: acompanhe o gasto por categoria e compare com os meses anteriores antes de decidir.',
};

export class FakeAdvisor implements AiAdvisor {
  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    if (pedido.tipo === 'pergunta-livre') {
      const dados = pedido.dados as { resumoDoGasto?: Array<{ categoria: string; totalEmCentavos: number }> } | undefined;
      const gastos = dados?.resumoDoGasto;
      if (gastos && gastos.length > 0) {
        const top = gastos.map((g) => g.categoria).filter(Boolean).slice(0, 3).join(', ');
        return okDeIa({
          texto: `Com base nas suas transações registradas, a maior concentração de gastos está em ${top}. Uma recomendação prática e educativa é planejar um teto semanal para essas áreas, monitorar lançamentos frequentes e priorizar necessidades imediatas para manter seu orçamento saudável.`,
          origem: 'provedor',
        });
      }
    }

    return okDeIa({ texto: RESPOSTAS[pedido.tipo], origem: 'provedor' });
  }
}
