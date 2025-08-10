
// src/services/authService.ts
import api from '../api';
import { UsuarioDTO } from '../../dto/UsuarioDTO';
import dayjs from 'dayjs';

interface LoginRequest {
  email: string;
  senha: string;
}

interface RegisterRequest {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  dataNascimento: string;
  estadoId: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    usuario: {
      id: number;
      nome: string;
      email: string;
      dataNascimento: string;
      estadoId: number;
      estadoNome: string;
    };
  };
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

class AuthService {
  // Login do usuário
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/login', credentials);

      if (response.data.success && response.data.data) {
        // Salvar token e dados do usuário no localStorage
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));

        // Configurar o header Authorization para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Erro ao realizar login' };
    }
  }

  // Registro de novo usuário
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Formatar a data para o formato esperado pelo backend (dd-MM-yyyy)
      const formattedData = {
        ...userData,
        dataNascimento: this.formatDateForBackend(userData.dataNascimento)
      };

      const response = await api.post<AuthResponse>('/user/register', formattedData);

      if (response.data.success && response.data.data) {
        // Salvar token e dados do usuário no localStorage
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));

        // Configurar o header Authorization
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Erro ao realizar cadastro' };
    }
  }

  // Solicitar recuperação de senha
  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await api.post('/user/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Erro ao solicitar recuperação de senha' };
    }
  }

  // Redefinir senha com token
  async resetPassword(data: ResetPasswordRequest): Promise<any> {
    try {
      const response = await api.post('/user/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Erro ao redefinir senha' };
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
  }

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Obter dados do usuário atual
  getCurrentUser(): any {
    const userStr = localStorage.getItem('usuario');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Validar token
  async validateToken(): Promise<boolean> {
    try {
      const response = await api.get('/user/validate');
      return response.data.success;
    } catch {
      return false;
    }
  }

  // Função auxiliar para formatar data
  private formatDateForBackend(date: any): string {
    // Se a data vier como objeto Dayjs
    if (dayjs.isDayjs(date)) {
      return date.format('DD/MM/YYYY');
    }

    // Se vier como string no formato DD/MM/YYYY, retorna como está
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }

    // Se vier no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return dayjs(date).format('DD/MM/YYYY');
    }

    // Se vier no formato DD-MM-YYYY, converte para DD/MM/YYYY
    if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split('-');
      return `${day}/${month}/${year}`;
    }

    // Tenta converter qualquer outro formato
    try {
      return dayjs(date).format('DD/MM/YYYY');
    } catch {
      return date;
    }
  }
}

export default new AuthService();