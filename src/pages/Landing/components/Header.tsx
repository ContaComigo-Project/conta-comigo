import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-[10px] border-b border-[#36b37e]/10 z-50 transition-all duration-150">
      <nav className="py-4 px-4 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-[1.125rem]">
            <img src="/assets/logos/logo.png" alt="ContaComigo Logo" className="w-12 h-12 object-contain" />
            <span>
              <span className="text-[#36b37e]">Conta</span>
              <span className="text-[#001b42]">Comigo</span>
            </span>
          </Link>

          <div className="hidden md:flex gap-7">
            <a href="#beneficios" className="font-semibold text-gray-600 transition duration-150 relative group hover:text-[#36b37e] text-sm tracking-tight">
              Benefícios
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-primary transition-all duration-150 group-hover:w-full"></span>
            </a>
            <a href="#funcionalidades" className="font-semibold text-gray-600 transition duration-150 relative group hover:text-[#36b37e] text-sm tracking-tight">
              Funcionalidades
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-primary transition-all duration-150 group-hover:w-full"></span>
            </a>
            <a href="#conectividade" className="font-semibold text-gray-600 transition duration-150 relative group hover:text-[#36b37e] text-sm tracking-tight">
              Conectividade
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-primary transition-all duration-150 group-hover:w-full"></span>
            </a>
            <a href="#faq" className="font-semibold text-gray-600 transition duration-150 relative group hover:text-[#36b37e] text-sm tracking-tight">
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-primary transition-all duration-150 group-hover:w-full"></span>
            </a>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            <Link to="/login" className="px-5 py-2 text-sm font-bold border-2 border-[#36b37e]/20 text-[#36b37e] rounded-xl transition duration-300 hover:border-[#36b37e] hover:bg-[#36b37e]/5 inline-flex items-center justify-center">Login</Link>
            <Link to="/register" className="px-5 py-2 text-sm font-bold bg-gradient-primary text-white rounded-xl shadow-[0_10px_20px_rgba(54,179,126,0.15)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(54,179,126,0.25)] inline-flex items-center justify-center">Abrir conta</Link>
          </div>

          <button
            className={`md:hidden flex flex-col justify-between w-8 h-6 bg-transparent border-none cursor-pointer relative z-[1051] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`w-full h-[3px] bg-[#001b42] rounded-[2px] transition-all duration-300 origin-center block transform ${isMobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
            <span className={`w-full h-[3px] bg-[#001b42] rounded-[2px] transition-all duration-300 origin-center block ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
            <span className={`w-full h-[3px] bg-[#001b42] rounded-[2px] transition-all duration-300 origin-center block transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1040] md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[320px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[1050] p-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/assets/logos/logo.png" alt="ContaComigo Logo" className="w-8 h-8 object-contain" />
            <span>
              <span className="text-[#36b37e]">Conta</span>
              <span className="text-[#001b42]">Comigo</span>
            </span>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex flex-col p-6 flex-grow overflow-y-auto">
          <nav className="flex flex-col gap-1 mb-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3 mb-2">Navegação</span>
            <a href="#beneficios" className="flex items-center justify-between p-4 rounded-xl text-gray-700 hover:bg-[#36b37e]/5 hover:text-[#36b37e] transition-all group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#36b37e]/10">
                  <i className="fas fa-star text-sm"></i>
                </div>
                <span className="font-semibold text-[0.95rem]">Benefícios</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] opacity-30 group-hover:opacity-100"></i>
            </a>
            <a href="#funcionalidades" className="flex items-center justify-between p-4 rounded-xl text-gray-700 hover:bg-[#36b37e]/5 hover:text-[#36b37e] transition-all group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#36b37e]/10">
                  <i className="fas fa-tools text-sm"></i>
                </div>
                <span className="font-semibold text-[0.95rem]">Funcionalidades</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] opacity-30 group-hover:opacity-100"></i>
            </a>
            <a href="#conectividade" className="flex items-center justify-between p-4 rounded-xl text-gray-700 hover:bg-[#36b37e]/5 hover:text-[#36b37e] transition-all group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#36b37e]/10">
                  <i className="fas fa-link text-sm"></i>
                </div>
                <span className="font-semibold text-[0.95rem]">Conectividade</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] opacity-30 group-hover:opacity-100"></i>
            </a>
            <a href="#faq" className="flex items-center justify-between p-4 rounded-xl text-gray-700 hover:bg-[#36b37e]/5 hover:text-[#36b37e] transition-all group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#36b37e]/10">
                  <i className="fas fa-question-circle text-sm"></i>
                </div>
                <span className="font-semibold text-[0.95rem]">FAQ</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] opacity-30 group-hover:opacity-100"></i>
            </a>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-4">
            <Link to="/login" className="w-full py-4 border-2 border-[#36b37e] text-[#36b37e] rounded-xl font-bold text-center hover:bg-[#36b37e] hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fas fa-sign-in-alt"></i> Login na plataforma
            </Link>
            <Link to="/register" className="w-full py-4 bg-gradient-primary text-white rounded-xl font-bold text-center shadow-[0_10px_20px_rgba(54,179,126,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(54,179,126,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fas fa-user-plus"></i> Abrir conta grátis
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
