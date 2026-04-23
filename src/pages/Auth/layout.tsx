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
            <img src="/assets/logos/logo.png" alt="ContaComigo Logo" className="w-8 h-8 object-contain" />
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

          {/* Testimonial */}
          <div className="mt-4 bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-white/90 text-[0.95rem] leading-relaxed italic mb-6">
              "O ContaComigo transformou a forma como gerencio meu dinheiro. Agora tenho controle total das minhas finanças!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <i className="fas fa-user text-sm"></i>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Lara Bragança</div>
                <div className="text-white/60 text-xs mt-0.5">Usuária desde 2025</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
