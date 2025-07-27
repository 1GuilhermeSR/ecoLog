// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../layout/AppLayout';
import Login from '../pages/login/Login';
import Home from '../pages/home/Home';
import EmissaoEnergia from '../pages/emissao_energia/EmissaoEnergia';
import EmissaoCombustivel from '../pages/emissao_combustivel/EmissaoCombustivel';


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/emissaoEnergia" element={<EmissaoEnergia />} />
          <Route path="/emissaoCombustivel" element={<EmissaoCombustivel />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}
