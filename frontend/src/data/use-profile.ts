import { useEffect, useState } from 'react';
import { getProfile } from './access';
import { mockUser } from '../mocks/user.mock';

// Perfil do titular vindo do banco (GET /access/accounts/me). Sem sessão ou
// falha, degrada para o usuário mock (nome de exibição local) — a tela nunca
// quebra por causa do perfil.
export interface PerfilExibido {
  nome: string;
  firstName: string;
  email: string;
  iniciais: string;
  cor: string;
}

const FALLBACK: PerfilExibido = {
  nome: mockUser.name,
  firstName: mockUser.firstName,
  email: mockUser.email,
  iniciais: mockUser.avatarInitials,
  cor: mockUser.avatarColor,
};

function iniciaisDe(nome: string, email: string): string {
  if (nome.trim()) return nome.trim().slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function useProfile(): PerfilExibido {
  const [perfil, setPerfil] = useState<PerfilExibido>(FALLBACK);

  useEffect(() => {
    let ativo = true;
    getProfile()
      .then((p) => {
        if (!ativo) return;
        const nome = p.name || p.email.split('@')[0];
        setPerfil({
          nome,
          firstName: nome.split(' ')[0],
          email: p.email,
          iniciais: iniciaisDe(p.name, p.email),
          cor: FALLBACK.cor,
        });
      })
      .catch(() => {
        if (ativo) setPerfil(FALLBACK);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return perfil;
}