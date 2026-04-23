import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-white flex-col lg:flex-row">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col relative w-full lg:max-w-[45%]">
        <div className="absolute top-0 w-full p-8 flex items-center justify-between z-10">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#36b37e] transition-colors font-medium text-sm">
            <i className="fas fa-arrow-left"></i>
            <span>Voltar</span>
          </Link>
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/assets/brand/icone-conta-comigo.png" alt="ContaComigo Logo" className="w-8 h-8 object-contain" />
            <span>
              <span className="text-[#36b37e]">Conta</span>
              <span className="text-[#001b42]">Comigo</span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 mt-16 lg:mt-0">
          <div className="w-full max-w-[380px] animate-fade-in">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Right Column - Benefits & Testimonial */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-primary items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 w-full max-w-[480px] flex flex-col gap-12">
          
          {/* Benefits */}
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl flex-shrink-0">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="mt-1">
                <h3 className="text-white font-bold text-lg mb-1">Segurança Total</h3>
                <p className="text-white/80 text-sm">Seus dados protegidos com criptografia de ponta</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl flex-shrink-0">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="mt-1">
                <h3 className="text-white font-bold text-lg mb-1">Análises Inteligentes</h3>
                <p className="text-white/80 text-sm">Insights personalizados para suas finanças</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl flex-shrink-0">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="mt-1">
                <h3 className="text-white font-bold text-lg mb-1">Acesso Multiplataforma</h3>
                <p className="text-white/80 text-sm">Gerencie suas finanças em qualquer dispositivo</p>
              </div>
            </div>
          </div>

          {/* Financial Snapshot Card */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden transition-transform duration-500">
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cc-green/20 rounded-full blur-2xl transition-colors"></div>
            
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Saldo Total</span>
                <div className="bg-cc-green/20 px-2 py-1 rounded text-cc-green text-[10px] font-bold">+12.5%</div>
              </div>
              
              <div className="flex items-end gap-2">
                <span className="text-white text-3xl font-bold tracking-tight">R$ 14.580,00</span>
                <span className="text-white/40 text-sm mb-1 pb-0.5">neste mês</span>
              </div>

              <div className="h-[1px] w-full bg-white/10 my-1"></div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70">Orçamento de Lazer</span>
                  <span className="text-white font-medium">85%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cc-green w-[85%] rounded-full shadow-[0_0_8px_rgba(54,179,126,0.5)]"></div>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-white/40 text-[10px] uppercase font-bold">Investido</span>
                  <span className="text-white text-sm font-semibold">R$ 4.200,00</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-4">
                  <span className="text-white/40 text-[10px] uppercase font-bold">Reserva</span>
                  <span className="text-white text-sm font-semibold">R$ 2.500,00</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
