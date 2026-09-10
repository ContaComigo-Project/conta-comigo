import nubankLogo from '../../../assets/banks/logo-nubank.png';
import itauLogo from '../../../assets/banks/logo-itau.png';
import bradescoLogo from '../../../assets/banks/logo-bradesco.png';
import santanderLogo from '../../../assets/banks/logo-santander.png';
import btgLogo from '../../../assets/banks/logo-btg-pactual.png';
import banrisulLogo from '../../../assets/banks/logo-banrisul.png';
import openFinanceLogo from '../../../assets/banks/logo-open-finance.png';

export default function Ecosystem() {
  const banks = [
    { name: 'Nubank', logo: nubankLogo },
    { name: 'Itaú', logo: itauLogo },
    { name: 'Bradesco', logo: bradescoLogo },
    { name: 'Santander', logo: santanderLogo },
    { name: 'BTG Pactual', logo: btgLogo },
    { name: 'Banrisul', logo: banrisulLogo },
  ];

  return (
    <section id="conectividade" className="py-24 bg-white overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 text-center">
        <div className="mb-16 flex flex-col items-center">
          <div className="mb-8">
            <img 
              src={openFinanceLogo} 
              alt="Open Finance Brasil" 
              className="h-16 w-auto object-contain opacity-90"
            />
          </div>
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
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {banks.map((bank) => (
              <div 
                key={bank.name} 
                className="w-28 md:w-36 h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 cursor-pointer"
                title={bank.name}
              >
                <img 
                  src={bank.logo} 
                  alt={bank.name} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-10">
          <div className="flex items-center gap-3 text-gray-400">
            <i className="fas fa-lock text-[#36b37e]"></i>
            <span className="text-sm font-medium">Segurança Bancária de Ponta</span>
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
