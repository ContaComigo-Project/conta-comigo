import LandingChatMock from './LandingChatMock';

const featuresList = [
  {
    title: 'Visão Consolidada Multi-banco',
    description: 'Saldo consolidado, gastos do mês e fatura do cartão em um único painel, com orçamento por categoria à vista.',
  },
  {
    title: 'Simulador de Compra no Orçamento',
    description: 'Informe o valor de um item planejado e veja o impacto real no semáforo do mês — sem incentivar crédito nem parcelamento.',
  },
  {
    title: 'Relatórios Detalhados',
    description: 'Exporte relatórios do orçamento e transações em PDF e CSV diretamente das telas de Despesas e Visão Geral.',
  },
  {
    title: 'Diagnóstico de IA em Linguagem Simples',
    description: 'A IA educativa resume a saúde do seu orçamento em texto claro, com aviso de que não é aconselhamento financeiro.',
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
