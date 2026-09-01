import React, { useState, useEffect } from 'react';
import { AnimatedButton } from '../../../components/ui/AnimatedButton';

export default function Hero() {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = 12450;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = targetValue / steps;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(currentStep * stepValue));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] pt-24 md:pt-0">
      <div className="absolute inset-0 z-0">
        <div className="absolute w-full h-full">
          <div
            className="absolute rounded-full bg-gradient-light"
            style={{ width: '20rem', height: '20rem', top: '10%', right: '10%', animation: 'float 6s ease-in-out infinite', animationDelay: '0s' }}
          ></div>
          <div
            className="absolute rounded-full bg-gradient-light"
            style={{ width: '15rem', height: '15rem', bottom: '20%', left: '5%', animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}
          ></div>
          <div
            className="absolute rounded-full bg-gradient-light"
            style={{ width: '12rem', height: '12rem', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'float 6s ease-in-out infinite', animationDelay: '4s' }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-300 mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center py-12 md:py-20 lg:py-24">
          <div className="max-w-140 mx-auto md:mx-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-[#001b42]">
              Conectando suas contas. <br />
              <span className="text-gradient-primary">Multiplicando suas escolhas.</span>
            </h1>
            <p className="text-lg leading-relaxed mb-10 text-gray-500">
              O ContaComigo une o ecossistema real do Open Finance aprovado pelo Banco Central à Inteligência Artificial para consolidar suas finanças, validar compras no seu orçamento e gerar insights personalizados baseados no seu gasto real.
            </p>
            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <AnimatedButton to="/register" size="lg" icon={<i className="fas fa-arrow-right"></i>}>
                Comece Agora
              </AnimatedButton>
              <a href="#beneficios" className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium bg-transparent border-2 border-[#001b42] text-[#001b42] rounded-md transition-all duration-150 hover:bg-[#001b42] hover:text-white inline-flex items-center">
                Saiba Mais
              </a>
            </div>
          </div>

          <div className="flex justify-center items-center mt-12 md:mt-0">
            <div className="relative w-full max-w-100">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-2xl border border-[#36b37e]/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-semibold text-[#001b42]">Visão Geral</div>
                  <div className="text-2xl font-bold text-[#36b37e]">
                    R$ {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="flex gap-2 items-end h-24">
                  <div className="flex-1 bg-gradient-primary rounded-sm min-h-4" style={{ animation: 'growUp 1s ease-out forwards', '--height': '60%' } as React.CSSProperties}></div>
                  <div className="flex-1 bg-gradient-primary rounded-sm min-h-4" style={{ animation: 'growUp 1s ease-out forwards', '--height': '80%' } as React.CSSProperties}></div>
                  <div className="flex-1 bg-gradient-primary rounded-sm min-h-4" style={{ animation: 'growUp 1s ease-out forwards', '--height': '45%' } as React.CSSProperties}></div>
                  <div className="flex-1 bg-gradient-primary rounded-sm min-h-4" style={{ animation: 'growUp 1s ease-out forwards', '--height': '90%' } as React.CSSProperties}></div>
                  <div className="flex-1 bg-gradient-primary rounded-sm min-h-4" style={{ animation: 'growUp 1s ease-out forwards', '--height': '70%' } as React.CSSProperties}></div>
                </div>
              </div>

              <div className="absolute w-full h-full inset-0 pointer-events-none hidden md:block">
                <div
                  className="absolute bg-white rounded-xl p-4 shadow-lg flex items-center gap-2 text-sm font-medium text-[#001b42]"
                  style={{ top: '-4rem', right: '-1rem', animation: 'floatCard 3s ease-in-out infinite', animationDelay: '0s' }}
                >
                  <i className="fas fa-credit-card text-[#36b37e]"></i>
                  <span>Cartões</span>
                </div>
                <div
                  className="absolute bg-white rounded-xl p-4 shadow-lg flex items-center gap-2 text-sm font-medium text-[#001b42]"
                  style={{ bottom: '-2rem', left: '-2rem', animation: 'floatCard 3s ease-in-out infinite', animationDelay: '1s' }}
                >
                  <i className="fas fa-chart-line text-[#36b37e]"></i>
                  <span>Investimentos</span>
                </div>
                <div
                  className="absolute bg-white rounded-xl p-4 shadow-lg flex items-center gap-2 text-sm font-medium text-[#001b42]"
                  style={{ top: '8rem', right: '-6rem', animation: 'floatCard 3s ease-in-out infinite', animationDelay: '2s' }}
                >
                  <i className="fas fa-piggy-bank text-[#36b37e]"></i>
                  <span>Economia</span>
                </div>
                <div
                  className="absolute bg-white rounded-xl p-4 shadow-lg flex items-center gap-2 text-sm font-medium text-[#001b42]"
                  style={{ bottom: '-4rem', right: '-1rem', animation: 'floatCard 4s ease-in-out infinite', animationDelay: '1.5s', zIndex: 20 }}
                >
                  <i className="fas fa-brain text-[#36b37e]"></i>
                  <span>Insights de IA</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
