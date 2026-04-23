const benefitsData = [
  {
    icon: 'fas fa-link',
    title: 'Integração Completa',
    description: 'Conecte todas suas contas bancárias, cartões e investimentos em um só lugar através do Open Finance.',
  },
  {
    icon: 'fas fa-chart-pie',
    title: 'Visualização Inteligente',
    description: 'Gráficos interativos e relatórios detalhados para entender seus hábitos financeiros.',
  },
  {
    icon: 'fas fa-robot',
    title: 'Categorização Inteligente',
    description: 'Despesas organizadas automaticamente por palavras-chave, sem complicações.',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Segurança Total',
    description: 'Criptografia de ponta e conformidade com LGPD para proteger seus dados financeiros.',
  },
  {
    icon: 'fas fa-graduation-cap',
    title: 'Educação Financeira',
    description: 'Dicas personalizadas e insights para melhorar sua saúde financeira continuamente.',
  },
  {
    icon: 'fas fa-mobile-alt',
    title: 'Acesso Multiplataforma',
    description: 'Interface responsiva que funciona perfeitamente em qualquer dispositivo.',
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-24 bg-white">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#001b42]">
            Por que escolher o ContaComigo?
          </h2>
          <p className="text-lg text-gray-500 max-w-[40rem] mx-auto">
            Descubra como nossa plataforma pode transformar sua relação com o dinheiro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefitsData.map((benefit, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl bg-[#f8f9fa] border border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#36b37e] hover:bg-white"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center text-2xl text-white">
                <i className={benefit.icon}></i>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#001b42]">
                {benefit.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
