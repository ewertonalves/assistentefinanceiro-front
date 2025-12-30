import api, { retryWithBackoff } from './api';
import type {
  PromptRequestDTO,
  AiResponse,
  StatusResponse,
} from '@/types/ai.types';
import type { MetaEconomiaDTO } from '@/types/goal.types';
import type { ApiResponse } from '@/types/api.types';

const AI_TIMEOUT = 60000;

export const aiService = {
  async gerarPlanoAcao(metaId: number): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.get<ApiResponse<AiResponse>>(
        `/api/ai/assistente-financeiro/plano-acao/${metaId}`,
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<AiResponse> };
    return response.data.dados.dados;
  },

  async analisarViabilidade(
    metaDTO: MetaEconomiaDTO
  ): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.post<ApiResponse<AiResponse>>(
        '/api/ai/assistente-financeiro/analisar-viabilidade',
        metaDTO,
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<AiResponse> };
    return response.data.dados.dados;
  },

  async obterSugestoesOtimizacao(contaId: number): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.get<ApiResponse<AiResponse>>(
        `/api/ai/assistente-financeiro/sugestoes-otimizacao/${contaId}`,
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<AiResponse> };
    return response.data.dados.dados;
  },

  async verificarStatusAssistente(): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<StatusResponse>>(
        '/api/ai/assistente-financeiro/status',
        { timeout: 5000 }
      );
      return response.data.dados.sucesso;
    } catch {
      return false;
    }
  },

  async responderComContexto(
    prompt: string,
    contaId?: number
  ): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.post<ApiResponse<string>>(
        '/api/ai/dinamica/responder',
        { prompt, contaId },
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<string> };
    return response.data.dados || '';
  },

  async responderSimples(prompt: string): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.post<ApiResponse<string>>(
        '/api/ai/dinamica/responder-simples',
        { prompt },
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<string> };
    return response.data.dados || '';
  },

  async manterConversacao(
    prompt: string,
    historico: string[],
    contaId?: number
  ): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.post<ApiResponse<string>>(
        '/api/ai/dinamica/conversacao',
        { prompt, historico, contaId },
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<string> };
    return response.data.dados || '';
  },

  async testeRapido(pergunta: string): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.post<ApiResponse<string>>(
        `/api/ai/dinamica/teste?pergunta=${encodeURIComponent(pergunta)}`,
        {},
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<string> };
    return response.data.dados || '';
  },

  async responderComDTO(data: PromptRequestDTO): Promise<string> {
    const response = await retryWithBackoff(() =>
      api.post<ApiResponse<string>>(
        '/api/ai/dinamica/responder-dto',
        data,
        { timeout: AI_TIMEOUT }
      )
    ) as { data: ApiResponse<string> };
    return response.data.dados || '';
  },

  async verificarStatusIADinamica(): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<StatusResponse>>(
        '/api/ai/dinamica/status',
        { timeout: 5000 }
      );
      return response.data.dados.sucesso;
    } catch {
      return false;
    }
  },
};

