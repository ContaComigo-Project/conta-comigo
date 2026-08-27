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
      <div className="w-full max-w-[1200px] mx-auto px-4">
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
            <div className="relative w-[16rem] h-128 bg-[#001b42] rounded-[2.5rem] p-3 shadow-xl">
              <div className="w-full h-full bg-[#f8f9fa] rounded-4xl overflow-hidden relative flex flex-col p-4 pt-8">
                {/* Header do Mockup */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-[#36b37e]/10 flex items-center justify-center text-[#36b37e]">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#001b42]">Consultor IA</div>
                    <div className="text-[10px] text-[#36b37e]">Online agora</div>
                  </div>
                </div>

                {/* Área de Mensagens */}
                <div className="flex flex-col gap-4">
                  {/* Bolha Usuário */}
                  <div className="self-end bg-[#36b37e]/10 text-[#001b42] text-xs p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                    Consigo comprar um notebook de R$ 3.000 até dezembro?
                  </div>

                  {/* Bolha IA */}
                  <div className="self-start bg-[#001b42] text-white text-xs p-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm leading-relaxed">
                    Analisando suas contas via Open Finance: Se mantivermos seu padrão atual de economia de R$ 400/mês, você alcançará a meta em Novembro! Deseja ativar essa meta?
                  </div>
                </div>

                {/* Input Fake */}
                <div className="mt-auto pt-4">
                  <div className="bg-white rounded-full p-2 px-4 flex justify-between items-center shadow-sm border border-gray-100">
                    <span className="text-xs text-gray-400">Digite sua mensagem...</span>
                    <i className="fas fa-paper-plane text-[#36b37e] text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
