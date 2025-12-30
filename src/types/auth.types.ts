export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface RegistroUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  role?: Role;
}

export interface JwtRequest {
  email: string;
  senha: string;
}

export interface UsuarioDTO {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

export interface LoginResponseDTO {
  token: string;
  tipo: string;
  usuario: UsuarioDTO;
}

