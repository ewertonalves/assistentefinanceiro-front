export enum TipoMeta {
  ECONOMIA_MENSAL = 'ECONOMIA_MENSAL',
  ECONOMIA_ANUAL = 'ECONOMIA_ANUAL',
  RESERVA_EMERGENCIA = 'RESERVA_EMERGENCIA',
  INVESTIMENTO_ESPECIFICO = 'INVESTIMENTO_ESPECIFICO',
  COMPRA_OBJETO = 'COMPRA_OBJETO',
  VIAGEM = 'VIAGEM',
  EDUCACAO = 'EDUCACAO',
  SAUDE = 'SAUDE',
  OUTROS = 'OUTROS',
}

export enum StatusMeta {
  ATIVA = 'ATIVA',
  CONCLUIDA = 'CONCLUIDA',
  PAUSADA = 'PAUSADA',
  CANCELADA = 'CANCELADA',
  VENCIDA = 'VENCIDA',
}

export interface MetaEconomiaDTO {
  id?: number;
  nome: string;
  descricao?: string;
  tipoMeta: TipoMeta;
  valorMeta: number;
  valorAtual?: number;
  dataInicio: string;
  dataFim: string;
  status?: StatusMeta;
  observacoes?: string;
  contaId: number;
  percentualConcluido?: number;
}

export interface AtualizarProgressoDTO {
  valorAdicionado: number;
}

