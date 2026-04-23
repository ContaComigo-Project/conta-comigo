export default function Ecosystem() {
  const banks = [
    { name: 'Nubank', color: 'text-gray-400 hover:text-[#8A05BE]' },
    { name: 'Itaú', color: 'text-gray-400 hover:text-[#EC7000]' },
    { name: 'Inter', color: 'text-gray-400 hover:text-[#FF7A00]' },
    { name: 'Bradesco', color: 'text-gray-400 hover:text-[#CC092F]' },
    { name: 'Santander', color: 'text-gray-400 hover:text-[#EC0000]' },
    { name: 'BTG Pactual', color: 'text-gray-400 hover:text-[#001b42]' },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 text-center">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#001b42] mb-4">
            Tudo Conectado via Open Finance
          </h2>
          <p className="text-gray-500 max-w-[700px] mx-auto text-lg leading-relaxed">
            Conectamos você às principais instituições financeiras do Brasil com segurança bancária.
            Sincronize seus dados e tenha a visão real do seu patrimônio em um único lugar.
          </p>
        </div>

        <div className="relative">
          {/* Decorative Gradients for sides - added pointer-events-none to fix hover bugs */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-500">
            {banks.map((bank) => (
              <div 
                key={bank.name} 
                className={`text-2xl md:text-3xl font-black tracking-tighter transition-all duration-300 grayscale hover:grayscale-0 cursor-default select-none ${bank.color}`}
              >
                {bank.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-10">
          <div className="flex items-center gap-3 text-gray-400">
            <i className="fas fa-lock text-[#36b37e]"></i>
            <span className="text-sm font-medium">Segurança Bancária AES-256</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <i className="fas fa-shield-alt text-[#36b37e]"></i>
            <span className="text-sm font-medium">Conformidade com LGPD</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <i className="fas fa-check-circle text-[#36b37e]"></i>
            <span className="text-sm font-medium">Acesso Somente Leitura</span>
          </div>
        </div>
      </div>
    </section>
  );
}
