export interface ApiResponse<T> {
  sucesso: boolean;
  mensagem: string;
  dados: T;
  timestamp?: number;
}

export interface ApiListResponse<T> {
  sucesso: boolean;
  mensagem: string;
  dados: T[];
  total?: number;
  timestamp?: number;
}

export interface ApiError {
  sucesso: false;
  mensagem: string;
  timestamp?: number;
}

