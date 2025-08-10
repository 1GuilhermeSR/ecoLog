import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../layout/AppLayout';
import Login from '../pages/login/Login';
import Home from '../pages/home/Home';
import Dashboard from '../pages/minhas_emissoes/Dashboard';
import EmissaoEnergia from '../pages/emissao_energia/EmissaoEnergia';
import EmissaoCombustivel from '../pages/emissao_combustivel/EmissaoCombustivel';
import Usuario from '../pages/usuario/Usuario';
import RecuperarSenha from '../pages/recuperar_senha/RecuperarSenha';
import ProtectedRoute from './ProtectedRoutes';


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperarSenha" element={<RecuperarSenha />} />

        {/* Rotas protegidas */}
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<Home />} />
          <Route path="/minhasEmissoes" element={<Dashboard />} />
          <Route path="/emissaoEnergia" element={<EmissaoEnergia />} />
          <Route path="/emissaoCombustivel" element={<EmissaoCombustivel />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}