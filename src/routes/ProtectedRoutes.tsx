import { Navigate } from 'react-router-dom';
import userService from '../services/usuario/usuarioService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/geral/Loading';
import { tokenManager } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Já tem token em memória, evita redirecionar durante o carregamento
  if (loading && tokenManager.hasToken()) {
    return <>{children}</>;
  }

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return <Loading />;
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}