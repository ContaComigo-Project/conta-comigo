import LandingChatMock from './LandingChatMock';

const featuresList = [
  {
    title: 'Visão Consolidada Multi-banco',
    description: 'Saldo consolidado, despesas do mês e orçamento total de múltiplos bancos em 3 cards com indicadores de tendência percentual mês a mês.',
  },
  {
    title: 'Simulador de Compra Orçamentária',
    description: 'Informe o valor do item desejado. A IA analisa seu orçamento e calcula múltiplos cenários de parcelamento mostrando o impacto real no mês e status de viabilidade.',
  },
  {
    title: 'Relatórios Detalhados',
    description: 'Exporte relatórios do orçamento e transações em PDF e CSV diretamente das telas de Despesas e Visão Geral.',
  },
  {
    title: 'Insights IA com Barra de Confiança',
    description: '3 tipos de diagnósticos automáticos — Oportunidades de economia, Alertas de risco e Metas recomendadas — todos com barra de confiança percentual e auto-rotação.',
  },
];

export default function Features() {
  return (
    <section id="funcionalidades" className="py-24 bg-[#f8f9fa]">
      <div className="w-full max-w-300 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-12 text-[#001b42]">
              Funcionalidades que fazem a diferença
            </h2>
            <div className="flex flex-col gap-8">
              {featuresList.map((feature, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="w-8 h-8 text-[#36b37e] text-xl shrink-0">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1 text-[#001b42]">
                      {feature.title}
                    </h4>
                    <p className="text-gray-500 m-0 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-76 h-144 bg-[#001b42] rounded-[2.75rem] p-3 shadow-2xl">
              <div className="w-full h-full rounded-[2.25rem] overflow-hidden">
                <LandingChatMock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
