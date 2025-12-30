import api from './api';
import type {
  MetaEconomiaDTO,
  AtualizarProgressoDTO,
} from '@/types/goal.types';
import type { ApiResponse, ApiListResponse } from '@/types/api.types';

export const goalsService = {
  async listarMetas(): Promise<MetaEconomiaDTO[]> {
    const response = await api.get<MetaEconomiaDTO[] | ApiListResponse<MetaEconomiaDTO>>(
      '/api/v1/metas'
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MetaEconomiaDTO>).dados) 
      ? (response.data as ApiListResponse<MetaEconomiaDTO>).dados 
      : [];
  },

  async buscarMetaPorId(id: number): Promise<MetaEconomiaDTO> {
    const response = await api.get<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      `/api/v1/metas/${id}`
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async criarMeta(data: MetaEconomiaDTO): Promise<MetaEconomiaDTO> {
    const response = await api.post<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      '/api/v1/metas',
      data
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async criarMetaComAnaliseIA(data: MetaEconomiaDTO): Promise<MetaEconomiaDTO> {
    const response = await api.post<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      '/api/v1/metas/com-analise-ia',
      data
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async atualizarMeta(
    id: number,
    data: MetaEconomiaDTO
  ): Promise<MetaEconomiaDTO> {
    const response = await api.put<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      `/api/v1/metas/${id}`,
      data
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async deletarMeta(id: number): Promise<void> {
    await api.delete(`/api/v1/metas/${id}`);
  },

  async listarMetasPorConta(contaId: number): Promise<MetaEconomiaDTO[]> {
    const response = await api.get<MetaEconomiaDTO[] | ApiListResponse<MetaEconomiaDTO>>(
      `/api/v1/metas/conta/${contaId}`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MetaEconomiaDTO>).dados) 
      ? (response.data as ApiListResponse<MetaEconomiaDTO>).dados 
      : [];
  },

  async atualizarProgresso(
    id: number,
    data: AtualizarProgressoDTO
  ): Promise<MetaEconomiaDTO> {
    const response = await api.put<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      `/api/v1/metas/${id}/progresso?valorAdicionado=${data.valorAdicionado}`,
      null
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async pausarMeta(id: number): Promise<MetaEconomiaDTO> {
    const response = await api.post<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      `/api/v1/metas/${id}/pausar`
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async reativarMeta(id: number): Promise<MetaEconomiaDTO> {
    const response = await api.post<MetaEconomiaDTO | ApiResponse<MetaEconomiaDTO>>(
      `/api/v1/metas/${id}/reativar`
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MetaEconomiaDTO;
    }
    return (response.data as ApiResponse<MetaEconomiaDTO>).dados;
  },

  async verificarMetasVencidas(): Promise<void> {
    await api.post('/api/v1/metas/verificar-vencidas');
  },

  async listarMetasVencidasPorConta(
    contaId: number
  ): Promise<MetaEconomiaDTO[]> {
    const response = await api.get<any>(
      `/api/v1/metas/conta/${contaId}/vencidas`
    );
    if (response.data.metas && Array.isArray(response.data.metas)) {
      return response.data.metas;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MetaEconomiaDTO>).dados) 
      ? (response.data as ApiListResponse<MetaEconomiaDTO>).dados 
      : [];
  },
};

