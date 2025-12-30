import api from './api';
import type {
  RegistroUsuarioDTO,
  JwtRequest,
  LoginResponseDTO,
  UsuarioDTO,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/utils/constants';

export const authService = {
  async registrarUsuario(data: RegistroUsuarioDTO): Promise<LoginResponseDTO> {
    const response = await api.post<ApiResponse<LoginResponseDTO>>(
      '/api/v1/auth/registrarUsuario',
      data
    );
    return response.data.dados;
  },

  async login(data: JwtRequest): Promise<LoginResponseDTO> {
    const response = await api.post<ApiResponse<LoginResponseDTO>>(
      '/api/v1/auth/login',
      data
    );
    const loginResponse = response.data.dados;
    
    localStorage.setItem(TOKEN_STORAGE_KEY, loginResponse.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loginResponse.usuario));
    
    return loginResponse;
  },

  async atualizarUsuario(data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
    const response = await api.put<ApiResponse<UsuarioDTO>>(
      '/api/v1/auth/atualizarUsuario',
      data
    );
    const usuarioAtualizado = response.data.dados;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioAtualizado));
    return usuarioAtualizado;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  getUsuario(): UsuarioDTO | null {
    const usuarioStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!usuarioStr) return null;
    try {
      return JSON.parse(usuarioStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

