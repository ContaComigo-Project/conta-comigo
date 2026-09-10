import { Routes, Route, Navigate } from 'react-router-dom';
import { Settings, Target } from 'lucide-react';
import Landing from '../pages/landing/Landing';
import AuthLayout from '../pages/auth/AuthLayout';
import Login from '../pages/auth/login/Login';
import Register from '../pages/auth/register/Register';
import DashboardLayout from '../pages/dashboard/DashboardLayout';
import Overview from '../pages/dashboard/overview/Overview';
import Expenses from '../pages/dashboard/expenses/Expenses';
import BanksPage from '../pages/dashboard/bancos/BanksPage';
import InvestmentsPage from '../pages/dashboard/investments/InvestmentsPage';
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
        <Route
          path="configuracoes"
          element={
            <PlaceholderPage
              title="Configurações"
              subtitle="Gerencie seus dados pessoais, segurança e preferências"
              description="Nesta seção você poderá atualizar seus dados cadastrais, alterar senha, gerenciar sessões ativas e exercer seus direitos de privacidade e exclusão de dados conforme a LGPD."
              icon={Settings}
              plannedFeatures={[
                'Gerenciamento de perfil e dados de contato',
                'Histórico de acessos e segurança da conta',
                'Preferências de notificações e limites de alerta',
                'Exclusão de conta e revogação definitiva de consentimentos LGPD',
              ]}
            />
          }
        />
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

