export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Péssima' | 'Fraca' | 'Média' | 'Forte' | 'Excelente';
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (!password) return { score: 0, label: 'Péssima', color: 'bg-gray-200' };

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const results: Record<number, Omit<PasswordStrength, 'score'>> = {
    0: { label: 'Péssima', color: 'bg-red-500' },
    1: { label: 'Fraca', color: 'bg-orange-500' },
    2: { label: 'Média', color: 'bg-yellow-500' },
    3: { label: 'Forte', color: 'bg-blue-500' },
    4: { label: 'Excelente', color: 'bg-green-500' },
  };

  return {
    score,
    ...results[score],
  };
}
