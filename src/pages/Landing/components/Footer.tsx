export default function Footer() {
  return (
    <footer className="bg-[#001b42] text-white pt-24 pb-8">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/assets/logos/logo.png" alt="ContaComigo Logo" className="w-8 h-8 filter brightness-0 invert" />
              <span className="text-xl font-bold">ContaComigo</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Conectando você ao seu dinheiro de forma segura, inteligente e acessível.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors duration-150 hover:bg-[#36b37e]" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors duration-150 hover:bg-[#36b37e]" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white transition-colors duration-150 hover:bg-[#36b37e]" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white mb-6 font-semibold text-lg">Produto</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Funcionalidades</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Preços</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Segurança</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-6 font-semibold text-lg">Empresa</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Sobre Nós</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Carreiras</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Blog</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Imprensa</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-6 font-semibold text-lg">Suporte</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Central de Ajuda</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Contato</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Status</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Comunidade</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-6 font-semibold text-lg">Legal</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Privacidade</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Termos</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">LGPD</a></li>
              <li><a href="#" className="text-white/80 transition-colors hover:text-white">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/60 text-sm mt-8">
          <p className="mb-2">
            © <span id="current-year">{new Date().getFullYear()}</span> ContaComigo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
