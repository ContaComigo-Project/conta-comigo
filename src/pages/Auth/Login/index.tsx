import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: implement login logic
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#001b42] mb-3">Bem-vindo de volta!</h1>
        <p className="text-gray-500 text-[0.95rem]">Entre na sua conta para continuar gerenciando suas finanças</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="loginEmail" className="font-bold text-gray-700 text-sm flex items-center gap-2">
            <i className="fas fa-envelope text-[#36b37e]"></i>
            E-mail
          </label>
          <input 
            type="email" 
            id="loginEmail" 
            name="email" 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem]"
            placeholder="seu@email.com" 
            required 
            autoComplete="email" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="loginPassword" className="font-bold text-gray-700 text-sm flex items-center gap-2">
            <i className="fas fa-lock text-[#36b37e]"></i>
            Senha
          </label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="loginPassword" 
              name="password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#36b37e] focus:ring-1 focus:ring-[#36b37e] transition-colors text-[0.95rem] pr-12"
              placeholder="Digite sua senha" 
              required 
              autoComplete="current-password" 
            />
            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 text-[0.85rem]">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" id="rememberMe" name="rememberMe" className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-200 rounded cursor-pointer checked:bg-[#36b37e] checked:border-[#36b37e] transition-colors" />
              <i className="fas fa-check absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
            </div>
            <span className="text-gray-500 font-medium transition-colors cursor-pointer pointer-events-none">Lembrar de mim</span>
          </label>
          <a href="#" className="font-semibold text-[#36b37e] hover:text-[#001b42] transition-colors">Esqueceu a senha?</a>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-[0.85rem] mt-2 bg-gradient-primary text-white rounded-lg font-bold text-[0.95rem] transition-all hover:opacity-90 hover:-translate-y-[2px] disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? (
            <>Carregando&nbsp;&nbsp;<i className="fas fa-spinner fa-spin"></i></>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-500 text-[0.95rem]">
        Não tem uma conta?{' '}
        <Link to="/register" className="font-bold text-[#36b37e] hover:text-[#001b42] transition-colors">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
