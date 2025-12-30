import api from './api';
import type { MovimentacaoFinanceiraDTO } from '@/types/transaction.types';
import type { RelatorioDadosDTO } from '@/types/report.types';
import type { ApiResponse, ApiListResponse } from '@/types/api.types';

export const transactionsService = {
  async listarMovimentacoes(): Promise<MovimentacaoFinanceiraDTO[]> {
    const response = await api.get<MovimentacaoFinanceiraDTO[] | ApiListResponse<MovimentacaoFinanceiraDTO>>(
      '/api/v1/movimentacoes'
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados)
      ? (response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados
      : [];
  },

  async buscarMovimentacaoPorId(id: number): Promise<MovimentacaoFinanceiraDTO> {
    const response = await api.get<MovimentacaoFinanceiraDTO | ApiResponse<MovimentacaoFinanceiraDTO>>(
      `/api/v1/movimentacoes/${id}`
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MovimentacaoFinanceiraDTO;
    }
    return (response.data as ApiResponse<MovimentacaoFinanceiraDTO>).dados;
  },

  async criarMovimentacao(data: MovimentacaoFinanceiraDTO): Promise<MovimentacaoFinanceiraDTO> {
    try {
      console.log('[transactionsService] POST /movimentacoes', data);
      const response = await api.post<MovimentacaoFinanceiraDTO | ApiResponse<MovimentacaoFinanceiraDTO>>(
        '/api/v1/movimentacoes',
        data
      );
      console.log('[transactionsService] POST response', response.status, response.data);
      if ((response.data as any).id !== undefined) {
        return response.data as MovimentacaoFinanceiraDTO;
      }
      return (response.data as ApiResponse<MovimentacaoFinanceiraDTO>).dados;
    } catch (error: any) {
      console.error('[transactionsService] POST error', error?.response?.status, error?.response?.data || error);
      throw error;
    }
  },

  async atualizarMovimentacao(
    id: number,
    data: MovimentacaoFinanceiraDTO
  ): Promise<MovimentacaoFinanceiraDTO> {
    try {
      console.log('[transactionsService] PUT /movimentacoes', { id, data });
      const response = await api.put<MovimentacaoFinanceiraDTO | ApiResponse<MovimentacaoFinanceiraDTO>>(
        `/api/v1/movimentacoes/${id}`,
        data
      );
      console.log('[transactionsService] PUT response', response.status, response.data);
      if ((response.data as any).id !== undefined) {
        return response.data as MovimentacaoFinanceiraDTO;
      }
      return (response.data as ApiResponse<MovimentacaoFinanceiraDTO>).dados;
    } catch (error: any) {
      console.error('[transactionsService] PUT error', error?.response?.status, error?.response?.data || error);
      throw error;
    }
  },

  async deletarMovimentacao(id: number): Promise<void> {
    await api.delete(`/api/v1/movimentacoes/${id}`);
  },

  async listarPorConta(contaId: number): Promise<MovimentacaoFinanceiraDTO[]> {
    const response = await api.get<MovimentacaoFinanceiraDTO[] | ApiListResponse<MovimentacaoFinanceiraDTO>>(
      `/api/v1/movimentacoes/conta/${contaId}`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados)
      ? (response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados
      : [];
  },

  async listarPorContaETipo(
    contaId: number,
    tipoMovimentacao: string
  ): Promise<MovimentacaoFinanceiraDTO[]> {
    const response = await api.get<
      MovimentacaoFinanceiraDTO[] | ApiListResponse<MovimentacaoFinanceiraDTO>
    >(`/api/v1/movimentacoes/conta/${contaId}/tipo/${tipoMovimentacao}`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados)
      ? (response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados
      : [];
  },

  async listarPorPeriodo(
    contaId: number,
    dataInicio: string,
    dataFim: string
  ): Promise<MovimentacaoFinanceiraDTO[]> {
    const response = await api.get<
      MovimentacaoFinanceiraDTO[] | ApiListResponse<MovimentacaoFinanceiraDTO>
    >(`/api/v1/movimentacoes/conta/${contaId}/periodo`, {
      params: { dataInicio, dataFim },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray((response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados)
      ? (response.data as ApiListResponse<MovimentacaoFinanceiraDTO>).dados
      : [];
  },

  async estornarMovimentacao(id: number): Promise<MovimentacaoFinanceiraDTO> {
    const response = await api.post<MovimentacaoFinanceiraDTO | ApiResponse<MovimentacaoFinanceiraDTO>>(
      `/api/v1/movimentacoes/${id}/estornar`
    );
    if ((response.data as any).id !== undefined) {
      return response.data as MovimentacaoFinanceiraDTO;
    }
    return (response.data as ApiResponse<MovimentacaoFinanceiraDTO>).dados;
  },

  async gerarRelatorioPDF(parametros: {
    contaId: number;
    dataInicio?: string;
    dataFim?: string;
    tipoMovimentacao?: string;
    tituloRelatorio?: string;
    incluirResumo?: boolean;
  }): Promise<Blob> {
    const response = await api.post(
      '/api/v1/movimentacoes/relatorio/pdf',
      parametros,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  async buscarDadosRelatorio(parametros: {
    contaId: number;
    dataInicio?: string;
    dataFim?: string;
    tipoMovimentacao?: string;
    tituloRelatorio?: string;
    incluirResumo?: boolean;
  }): Promise<RelatorioDadosDTO> {
    const response = await api.post<RelatorioDadosDTO>(
      '/api/v1/movimentacoes/relatorio/dados',
      parametros
    );
    return response.data;
  },
};

