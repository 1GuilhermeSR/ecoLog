import api, { tokenManager } from '../api';
import { UsuarioDTO } from '../../dto/usuario/UsuarioDTO';
import { LoginRequestDTO } from '../../dto/usuario/LoginRequestDTO';
import { AuthResponseDTO } from '../../dto/usuario/AuthResponseDTO';
import { RegisterRequestDTO } from '../../dto/usuario/RegisterRequestDTO';
import { ResetPasswordRequestDTO } from '../../dto/usuario/ResetPasswordRequestDTO';
import { ServiceResultDTO } from '../../dto/ServiceResultDTO';

class UsuarioService {

  async login(credentials: LoginRequestDTO): Promise<AuthResponseDTO> {
    try {
      const response = await api.post<AuthResponseDTO>('/user/login', credentials);

      if (response.data.success && response.data.data) {
        tokenManager.setToken(response.data.data.accessToken);

        sessionStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
      }

      return response.data;
    } catch (error) {
      throw { success: false, message: 'Erro ao realizar login\n', error };
    }
  }

  async register(userData: RegisterRequestDTO): Promise<AuthResponseDTO> {
    try {
      const response = await api.post<AuthResponseDTO>('/user/register', userData);

      if (response.data.success && response.data.data) {
        // Salva token em memória
        tokenManager.setToken(response.data.data.accessToken);
        sessionStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
      }

      return response.data;
    } catch (error) {
      throw { success: false, message: 'Erro ao realizar cadastro\n', error };
    }
  }

  async editarEstado(usuario: UsuarioDTO): Promise<ServiceResultDTO> {
    try {
      const response = await api.put<ServiceResultDTO>(`/user/editarEstado`, usuario);

      if (response.data.success) {
        sessionStorage.setItem('usuario', JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      throw { success: false, message: 'Erro ao editar estado\n', error };
    }
  }

  async excluirConta(): Promise<ServiceResultDTO> {
    try {
      const response = await api.delete<ServiceResultDTO>(`/user/excluirUsuario`);

      if (response.data.success) {
        this.logout();
      }

      return response.data;
    } catch (error) {
      throw { success: false, message: 'Erro ao excluir conta\n', error };
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/user/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      tokenManager.clearToken();
      sessionStorage.removeItem('usuario');
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await api.post('/user/forgotPassword', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Erro ao solicitar recuperação de senha' };
    }
  }

  async resetPassword(data: ResetPasswordRequestDTO): Promise<any> {
    try {
      const response = await api.post('/user/resetPassword', data);
      return response.data;
    } catch (error) {
      throw { success: false, message: 'Erro ao redefinir senha\n', error };
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await api.get('/user/validate');
      return response.data.success;
    } catch {
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post('/user/refresh', {});

      if (response.data.success && response.data.data) {
        tokenManager.setToken(response.data.data.accessToken);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return tokenManager.hasToken();
  }

  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('usuario');
    if(userStr != "undefined") {
      return userStr ? JSON.parse(userStr) : null;
    }
    else {
      return null;
    }
  }

}

export default new UsuarioService();