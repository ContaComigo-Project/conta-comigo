import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../../validations/auth.schema';
import { useToast } from '../../../hooks/use-toast';
import { entrar, FalhaDeAcesso } from '../../../dados/acesso';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // A credencial NUNCA e registrada em log — nem em desenvolvimento (RNF-015).
  // Ate HN-001 esta funcao registrava o objeto do formulario no console do
  // navegador — a senha junto.
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await entrar({ email: data.email, senha: data.password });
      toast({
        variant: "success",
        title: "Login realizado!",
        description: "Redirecionando para a aplicação...",
      });
      navigate('/dashboard');
    } catch (erro) {
      // A mensagem vem da API e e deliberadamente a mesma para e-mail
      // inexistente e senha errada (RF-002).
      toast({
        variant: "destructive",
        title: "Não foi possível entrar",
        description: erro instanceof FalhaDeAcesso ? erro.message : "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#001b42] mb-3">Bem-vindo de volta!</h1>
        <p className="text-gray-500 text-[0.95rem]">Entre na sua conta para continuar gerenciando suas finanças</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="loginEmail" className="font-bold text-gray-700 text-sm flex items-center gap-2">
            <i className="fas fa-envelope text-[#36b37e]"></i>
            E-mail
          </label>
          <input
            type="email"
            id="loginEmail"
            {...register('email')}
            className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] focus:outline-none focus:ring-1 ${errors.email
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
              }`}
            placeholder="seu@email.com"
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.email.message}</span>
          )}
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
              {...register('password')}
              className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] pr-12 focus:outline-none focus:ring-1 ${errors.password
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                }`}
              placeholder="Digite sua senha"
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
          {errors.password && (
            <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.password.message}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 text-[0.85rem]">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-200 rounded cursor-pointer checked:bg-[#36b37e] checked:border-[#36b37e] transition-colors"
              />
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
