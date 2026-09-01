import LandingChatMock from './LandingChatMock';

const featuresList = [
  {
    title: 'Metas Financeiras',
    description: 'Defina e acompanhe suas metas de economia e investimento',
  },
  {
    title: 'Simulador de Metas Realista',
    description: 'A IA analisa sua renda consolidada de múltiplos bancos e calcula prazos e aportes reais para você alcançar seus objetivos sem passar sufoco.',
  },
  {
    title: 'Relatórios Detalhados',
    description: 'Exporte relatórios em PDF e CSV para análise completa',
  },
  {
    title: 'Mapa de Calor de Gastos',
    description: 'Visualize os maiores gastos por categoria com gráficos de temperatura.',
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
