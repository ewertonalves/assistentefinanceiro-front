import api from './api';
import type { DadosContaDTO } from '@/types/account.types';
import type { ApiResponse, ApiListResponse } from '@/types/api.types';

export const accountsService = {
  async listarContas(): Promise<DadosContaDTO[]> {
    const response = await api.get<DadosContaDTO[] | ApiListResponse<DadosContaDTO>>(
      '/api/v1/contas'
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<DadosContaDTO>).dados) 
      ? (response.data as ApiListResponse<DadosContaDTO>).dados 
      : [];
  },

  async buscarContaPorId(id: number): Promise<DadosContaDTO> {
    const response = await api.get<DadosContaDTO | ApiResponse<DadosContaDTO>>(
      `/api/v1/contas/${id}`
    );
    if ((response.data as any).id !== undefined) {
      return response.data as DadosContaDTO;
    }
    return (response.data as ApiResponse<DadosContaDTO>).dados;
  },

  async criarConta(data: DadosContaDTO): Promise<DadosContaDTO> {
    const response = await api.post<DadosContaDTO | ApiResponse<DadosContaDTO>>(
      '/api/v1/contas',
      data
    );
    if ((response.data as any).id !== undefined) {
      return response.data as DadosContaDTO;
    }
    return (response.data as ApiResponse<DadosContaDTO>).dados;
  },

  async atualizarConta(id: number, data: DadosContaDTO): Promise<DadosContaDTO> {
    const response = await api.put<DadosContaDTO | ApiResponse<DadosContaDTO>>(
      `/api/v1/contas/${id}`,
      data
    );
    if ((response.data as any).id !== undefined) {
      return response.data as DadosContaDTO;
    }
    return (response.data as ApiResponse<DadosContaDTO>).dados;
  },

  async deletarConta(id: number): Promise<void> {
    await api.delete(`/api/v1/contas/${id}`);
  },
};

