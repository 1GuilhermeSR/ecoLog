// src/routes/AppRoutes.tsx
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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/minhasEmissoes" element={<Dashboard />} />
          <Route path="/emissaoEnergia" element={<EmissaoEnergia />} />
          <Route path="/emissaoCombustivel" element={<EmissaoCombustivel />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
         <Route path="/recuperarSenha" element={<RecuperarSenha/>} />
        

      </Routes>
    </BrowserRouter>
  );
}
