import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/landing/Landing';
import AuthLayout from '../pages/auth/AuthLayout';
import Login from '../pages/auth/login/Login';
import Register from '../pages/auth/register/Register';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
