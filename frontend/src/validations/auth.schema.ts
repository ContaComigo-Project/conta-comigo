import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('Formato de e-mail inválido'),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('Formato de e-mail inválido'),
  cpf: z.string()
    .min(11, 'CPF deve ter pelo menos 11 dígitos')
    .max(14, 'CPF inválido'),
  birthDate: z.string()
    .min(1, 'Data de nascimento é obrigatória'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Confirme sua senha'),
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Você deve aceitar os termos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
