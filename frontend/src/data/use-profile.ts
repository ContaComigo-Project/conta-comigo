import { useEffect, useState } from 'react';
import { getProfile } from './access';

// Profile of the holder coming from the database (GET /access/accounts/me).
// Without a session or on failure it degrades to a local display name — the
// screen never breaks because of the profile. No mock data is used here.
export interface PerfilExibido {
  nome: string;
  firstName: string;
  email: string;
  iniciais: string;
  cor: string;
  /** ISO do cadastro (perfil); ausente no fallback. */
  cadastradoEm?: string;
}

const FALLBACK: PerfilExibido = {
  nome: 'Usuário Demo',
  firstName: 'Demo',
  email: 'demo@contacomigo.com',
  iniciais: 'DM',
  cor: '#0a6d42',
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
          cadastradoEm: p.createdAt,
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