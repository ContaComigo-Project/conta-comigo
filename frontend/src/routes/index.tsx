import { Routes, Route, Navigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import Landing from '../pages/landing/Landing';
import AuthLayout from '../pages/auth/AuthLayout';
import Login from '../pages/auth/login/Login';
import Register from '../pages/auth/register/Register';
import DashboardLayout from '../pages/dashboard/DashboardLayout';
import Overview from '../pages/dashboard/overview/Overview';
import Expenses from '../pages/dashboard/expenses/Expenses';
import BanksPage from '../pages/dashboard/bancos/BanksPage';
import InvestmentsPage from '../pages/dashboard/investments/InvestmentsPage';
import SettingsPage from '../pages/dashboard/settings/SettingsPage';
import PlaceholderPage from '../pages/dashboard/placeholder/PlaceholderPage';
import { RequireAuth } from '../components/RequireAuth';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="bancos" element={<BanksPage />} />
        <Route path="investimentos" element={<InvestmentsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route
          path="metas"
          element={
            <PlaceholderPage
              title="Metas Financeiras"
              subtitle="Planejamento e acompanhamento dos seus objetivos financeiros"
              description="Crie e acompanhe metas de curto, médio e longo prazo (reserva de emergência, viagens, compras planejadas) integradas ao simulador de impacto orçamentário."
              icon={Target}
              plannedFeatures={[
                'Criação de metas com prazos e valores alvo',
                'Aporte sugerido mensal com base no seu fluxo de caixa',
                'Simulações com o assistente IA educacional',
                'Avisos de progresso e desvios de orçamento',
              ]}
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

