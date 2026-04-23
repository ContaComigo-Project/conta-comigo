import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../../validations/auth.schema';
import { calculatePasswordStrength } from '../../../utils/password';
import { formatCPF } from '../../../utils/formatters';
import { useToast } from '../../../hooks/use-toast';

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const password = watch('password', '');
  const cpfValue = watch('cpf', '');
  const strength = calculatePasswordStrength(password);

  useEffect(() => {
    if (cpfValue) {
      setValue('cpf', formatCPF(cpfValue), { shouldValidate: true });
    }
  }, [cpfValue, setValue]);

  const handleNextStep = async () => {
    const isValid = await trigger(['fullName', 'email', 'cpf', 'birthDate']);
    if (isValid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = (data: RegisterFormData) => {
    setIsLoading(true);
    console.log('Register attempt:', data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        variant: "success",
        title: "Cadastro realizado!",
        description: "Sua conta foi criada. Redirecionando...",
      });
      navigate('/login');
    }, 2000);
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <i className="fas fa-user text-[#36b37e]"></i>
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                {...register('fullName')}
                className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] focus:outline-none focus:ring-1 ${errors.fullName
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                    : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                  }`}
                placeholder="Digite seu nome completo"
              />
              {errors.fullName && (
                <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.fullName.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="registerEmail" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <i className="fas fa-envelope text-[#36b37e]"></i>
                E-mail
              </label>
              <input
                type="email"
                id="registerEmail"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] focus:outline-none focus:ring-1 ${errors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                    : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                  }`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.email.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="cpf" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <i className="fas fa-id-card text-[#36b37e]"></i>
                  CPF
                </label>
                <input
                  type="text"
                  id="cpf"
                  {...register('cpf')}
                  maxLength={14}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] focus:outline-none focus:ring-1 ${errors.cpf
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                    }`}
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.cpf.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="birthDate" className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-[#36b37e]"></i>
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  {...register('birthDate')}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] focus:outline-none focus:ring-1 ${errors.birthDate
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                    }`}
                />
                {errors.birthDate && (
                  <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.birthDate.message}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-[0.85rem] mt-2 bg-gradient-primary text-white rounded-lg font-bold text-[0.95rem] transition-all hover:opacity-90 hover:-translate-y-[2px] shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
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
                  {...register('password')}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] pr-12 focus:outline-none focus:ring-1 ${errors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                    }`}
                  placeholder="Crie uma senha forte"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex gap-1 h-[4px]">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-gray-200'}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[0.65rem] font-bold text-right uppercase tracking-wider text-gray-400">
                    Força: <span style={{ color: strength.color.replace('bg-', '') }}>{strength.label}</span>
                  </span>
                </div>
              )}

              {errors.password && (
                <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.password.message}</span>
              )}
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
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors text-[0.95rem] pr-12 focus:outline-none focus:ring-1 ${errors.confirmPassword
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-[#36b37e] focus:ring-[#36b37e]'
                    }`}
                  placeholder="Confirme sua senha"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs font-medium animate-fade-in">{errors.confirmPassword.message}</span>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mt-2 text-[0.85rem]">
              <div className="relative flex items-center justify-center mt-[3px]">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  {...register('acceptTerms')}
                  className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-200 rounded cursor-pointer checked:bg-[#36b37e] checked:border-[#36b37e] transition-colors"
                />
                <i className="fas fa-check absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
              </div>
              <span className="text-gray-500 leading-relaxed font-medium">
                Aceito os <a href="#" className="font-bold text-[#36b37e] hover:underline">Termos de Uso</a> e <a href="#" className="font-bold text-[#36b37e] hover:underline">Política de Privacidade</a>
              </span>
            </label>
            {errors.acceptTerms && (
              <span className="text-red-500 text-xs font-medium animate-fade-in -mt-4">{errors.acceptTerms.message}</span>
            )}

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
                className="flex-1 py-[0.85rem] bg-gradient-primary text-white rounded-lg font-bold text-[0.95rem] shadow-md transition-all hover:opacity-90 hover:-translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed uppercase tracking-wide"
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
