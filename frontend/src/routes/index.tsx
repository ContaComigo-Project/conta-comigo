import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/landing/Landing';
import AuthLayout from '../pages/auth/AuthLayout';
import Login from '../pages/auth/login/Login';
import Register from '../pages/auth/register/Register';
import DashboardLayout from '../pages/dashboard/DashboardLayout';
import Overview from '../pages/dashboard/overview/Overview';
import Expenses from '../pages/dashboard/expenses/Expenses';
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
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
