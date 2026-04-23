import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-[10px] border-b border-[#36b37e]/10 z-50 transition-all duration-150">
      <nav className="py-6 py-4 px-4 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[1.125rem]">
            <img src="/assets/logos/logo.png" alt="ContaComigo Logo" className="w-12 h-12 object-contain" />
            <span>
              <span className="text-[#36b37e]">Conta</span>
              <span className="text-[#001b42]">Comigo</span>
            </span>
          </div>
          
          <div className="hidden md:flex gap-7">
            <a href="#beneficios" className="font-medium text-gray-700 transition duration-150 relative group hover:text-[#36b37e]">
              Benefícios
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-primary transition-all duration-150 group-hover:w-full"></span>
            </a>
            <a href="#faq" className="font-medium text-gray-700 transition duration-150 relative group hover:text-[#36b37e]">
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-primary transition-all duration-150 group-hover:w-full"></span>
            </a>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            <Link to="/login" className="px-4 py-[0.225rem] text-[0.7875rem] font-medium border-2 border-[#36b37e] text-[#36b37e] rounded-md transition duration-150 hover:bg-[#36b37e] hover:text-white inline-flex items-center justify-center">Login</Link>
            <Link to="/register" className="px-4 py-[0.225rem] text-[0.7875rem] font-medium bg-gradient-primary text-white rounded-md shadow-md transition duration-150 hover:-translate-y-[2px] hover:shadow-lg inline-flex items-center justify-center">Cadastro</Link>
          </div>

          <button 
            className="md:hidden flex flex-col justify-between w-8 h-6 bg-transparent border-none cursor-pointer relative z-[1050]" 
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
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[1040] md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[1050] p-6 transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src="/assets/logos/logo.png" alt="ContaComigo Logo" className="w-8 h-8 object-contain" />
            <span>
              <span className="text-[#36b37e]">Conta</span>
              <span className="text-[#001b42]">Comigo</span>
            </span>
          </div>
          <button className="text-gray-500 hover:text-red-500 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <a href="#beneficios" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#36b37e] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fas fa-star w-5 text-center"></i>
            <span className="font-medium">Benefícios</span>
          </a>
          <a href="#faq" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#36b37e] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fas fa-question-circle w-5 text-center"></i>
            <span className="font-medium">FAQ</span>
          </a>
        </nav>

        <div className="flex flex-col gap-3 mt-auto">
          <Link to="/login" className="w-full py-3 border-2 border-[#36b37e] text-[#36b37e] rounded-lg font-medium text-center hover:bg-[#36b37e] hover:text-white transition-colors flex items-center justify-center gap-2">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
          <Link to="/register" className="w-full py-3 bg-gradient-primary text-white rounded-lg font-medium text-center shadow-md hover:-translate-y-1 hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <i className="fas fa-user-plus"></i> Cadastro
          </Link>
        </div>
      </div>
    </header>
  );
}
