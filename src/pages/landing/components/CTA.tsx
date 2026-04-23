import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-primary text-center">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="max-w-[40rem] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-lg text-white/90 mb-10">
            Junte-se a milhares de usuários que já estão no controle de suas finanças
          </p>
          <Link to="/register" className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium bg-white text-[#001b42] rounded-md shadow-md transition-all duration-150 hover:bg-[#f8f9fa] inline-flex items-center group relative overflow-hidden">
            <span className="relative z-10 flex items-center">
              Comece Agora Gratuitamente
              <i className="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
