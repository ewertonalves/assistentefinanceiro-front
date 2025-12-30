import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { UsuarioDTO, JwtRequest, RegistroUsuarioDTO, LoginResponseDTO } from '@/types/auth.types';

interface AuthContextType {
  usuario: UsuarioDTO | null;
  isLoading: boolean;
  login: (data: JwtRequest) => Promise<LoginResponseDTO>;
  register: (data: RegistroUsuarioDTO) => Promise<LoginResponseDTO>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (data: Partial<UsuarioDTO>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = authService.getUsuario();
      setUsuario(storedUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (data: JwtRequest): Promise<LoginResponseDTO> => {
    const response = await authService.login(data);
    setUsuario(response.usuario);
    return response;
  };

  const register = async (data: RegistroUsuarioDTO): Promise<LoginResponseDTO> => {
    const response = await authService.registrarUsuario(data);
    localStorage.setItem('assistente_financeiro_token', response.token);
    localStorage.setItem('assistente_financeiro_usuario', JSON.stringify(response.usuario));
    setUsuario(response.usuario);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const updateUser = async (data: Partial<UsuarioDTO>) => {
    const updatedUser = await authService.atualizarUsuario(data);
    setUsuario(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!usuario && authService.isAuthenticated(),
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

