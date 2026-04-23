const featuresList = [
  {
    title: 'Metas Financeiras',
    description: 'Defina e acompanhe suas metas de economia e investimento',
  },
  {
    title: 'Alertas Inteligentes',
    description: 'Receba notificações sobre gastos excessivos e oportunidades',
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
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-12 text-[#001b42]">
              Funcionalidades que fazem a diferença
            </h2>
            <div className="flex flex-col gap-8">
              {featuresList.map((feature, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="w-8 h-8 text-[#36b37e] text-xl flex-shrink-0">
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
            <div className="relative w-[16rem] h-[32rem] bg-[#001b42] rounded-[2.5rem] p-3 shadow-xl">
              <div className="w-full h-full bg-[#f8f9fa] rounded-[2rem] overflow-hidden relative flex items-center justify-center text-gray-400 text-sm text-center px-4">
                <span className="opacity-50">Imagem da aplicação será inserida aqui</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
