import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken, restoreSession } from '../data/access';

// Guard de rota: sem sessão não há dashboard. No primeiro carregamento tenta
// restaurar a sessão pelo cookie httpOnly do refresh (HT-018) antes de decidir
// — F5 e navegação direta deixam de expulsar a pessoa logada.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [checando, setChecando] = useState(true);
  const [temSessao, setTemSessao] = useState<boolean>(() => getAccessToken() !== null);

  useEffect(() => {
    let ativo = true;
    void restoreSession().then((ok) => {
      if (!ativo) return;
      setTemSessao(ok || getAccessToken() !== null);
      setChecando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  if (checando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400 animate-pulse">Verificando sessão...</p>
      </div>
    );
  }

  if (!temSessao) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}