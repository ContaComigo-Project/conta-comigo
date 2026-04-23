import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    // Basic validation could go here before proceeding
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: implement register logic
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#001b42] mb-2">
          {step === 1 ? 'Crie sua conta' : 'Quase lá!'}
        </h1>
        <p className="text-gray-500 mb-8 text-[0.95rem]">
          {step === 1 
            ? 'Comece a gerenciar suas finanças de forma inteligente' 
            : 'Agora vamos configurar sua segurança'}
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 max-w-[300px] mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-[#36b37e] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <i className="fas fa-check"></i> : '1'}
            </div>
            <span className={`text-[0.65rem] font-bold ${step >= 1 ? 'text-[#36b37e]' : 'text-gray-400'}`}>DADOS PESSOAIS</span>
          </div>
          
          <div className={`flex-1 h-[2px] transition-colors ${step > 1 ? 'bg-[#36b37e]' : 'bg-gray-200'} -mt-4`}></div>
          
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 2 ? 'bg-[#36b37e] text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <span className={`text-[0.65rem] font-bold ${step === 2 ? 'text-[#36b37e]' : 'text-gray-400'}`}>SEGURANÇA</span>
          </div>
        </div>
      </div>

      <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="flex flex-col gap-6">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <i className="fas fa-user text-[#36b37e]"></i>
                Nome Completo
              </label>
              <input type="text" id="fullName" name="fullName" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem]" placeholder="Digite seu nome completo" required />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="registerEmail" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <i className="fas fa-envelope text-[#36b37e]"></i>
                E-mail
              </label>
              <input type="email" id="registerEmail" name="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem]" placeholder="seu@email.com" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="cpf" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <i className="fas fa-id-card text-[#36b37e]"></i>
                  CPF
                </label>
                <input type="text" id="cpf" name="cpf" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem]" placeholder="000.000.000-00" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="birthDate" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-[#36b37e]"></i>
                  Data de Nascimento
                </label>
                <input type="date" id="birthDate" name="birthDate" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem]" required />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleNextStep}
              className="w-full py-[0.85rem] mt-2 bg-gradient-primary text-white rounded-lg font-bold text-[0.95rem] transition-all hover:opacity-90 hover:-translate-y-[2px] shadow-md flex items-center justify-center gap-2"
            >
              Continuar <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="registerPassword" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <i className="fas fa-lock text-[#36b37e]"></i>
                Senha
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="registerPassword" 
                  name="password" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem] pr-12"
                  placeholder="Crie uma senha forte" 
                  required 
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <div className="flex gap-1 mt-1">
                 <div className="h-[3px] flex-1 bg-red-400 rounded-full"></div>
                 <div className="h-[3px] flex-1 bg-gray-200 rounded-full"></div>
                 <div className="h-[3px] flex-1 bg-gray-200 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-400 text-right font-medium">Força da senha</span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <i className="fas fa-lock text-[#36b37e]"></i>
                Confirmar Senha
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem] pr-12"
                  placeholder="Confirme sua senha" 
                  required 
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mt-2 text-[0.85rem]">
              <div className="relative flex items-center justify-center mt-[3px]">
                <input type="checkbox" id="acceptTerms" name="acceptTerms" className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-200 rounded cursor-pointer checked:bg-[#36b37e] checked:border-[#36b37e] transition-colors" required />
                <i className="fas fa-check absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
              </div>
              <span className="text-gray-500 leading-relaxed font-medium">
                Aceito os <a href="#" className="font-bold text-[#36b37e] hover:underline">Termos de Uso</a> e <a href="#" className="font-bold text-[#36b37e] hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <div className="flex gap-4 mt-2">
              <button 
                type="button" 
                onClick={handlePrevStep}
                className="w-1/3 py-[0.85rem] bg-gray-100 text-gray-600 rounded-lg font-bold text-[0.95rem] transition-all hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <i className="fas fa-arrow-left"></i> Voltar
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 py-[0.85rem] bg-gradient-primary text-white rounded-lg font-bold text-[0.95rem] shadow-md transition-all hover:opacity-90 hover:-translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>Carregando&nbsp;&nbsp;<i className="fas fa-spinner fa-spin"></i></>
                ) : (
                  <>Criar Conta</>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-8 text-center text-gray-500 text-[0.95rem]">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-bold text-[#36b37e] hover:text-[#001b42] transition-colors">
          Faça login
        </Link>
      </div>
    </div>
  );
}
