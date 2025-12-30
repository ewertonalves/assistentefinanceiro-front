import type { MovimentacaoFinanceiraDTO } from './transaction.types';

export interface RelatorioDadosDTO {
  tituloRelatorio: string;
  conta: DadosContaResumoDTO;
  dataGeracao: string;
  movimentacoes: MovimentacaoFinanceiraDTO[];
  totalReceitas: number | string;
  totalDespesas: number | string;
  saldoLiquido: number | string;
  saldoAtual: number | string;
  dataInicio?: string;
  dataFim?: string;
  tipoMovimentacao?: string;
}

export interface DadosContaResumoDTO {
  banco: string;
  numeroAgencia: string;
  numeroConta: string;
  responsavel: string;
}

