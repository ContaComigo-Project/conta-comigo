import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing/index';
import AuthLayout from '../pages/Auth/layout';
import Login from '../pages/Auth/Login/index';
import Register from '../pages/Auth/Register/index';

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
