export interface PromptRequest {
  prompt: string;
  contaId?: number;
  historico?: string[];
}

export interface PromptRequestDTO {
  prompt: string;
  contaId?: number;
  historico?: string[];
}

export interface AiResponse {
  sucesso: boolean;
  mensagem: string;
  dados: string;
  timestamp: string;
}

export interface StatusResponse {
  sucesso: boolean;
  mensagem: string;
  dados: string;
  timestamp: string;
}

