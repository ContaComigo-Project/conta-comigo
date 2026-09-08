import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../data/access';

// Guard de rota: sem token não há dashboard. Redireciona para /login lembrando
// de onde veio, para voltar depois de autenticar.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}