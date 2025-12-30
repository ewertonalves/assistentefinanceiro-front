export enum TipoMovimentacao {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  INVESTIMENTO = 'INVESTIMENTO',
}

export enum CategoriaFinanceira {
  // Receitas
  SALARIO = 'SALARIO',
  VENDAS = 'VENDAS',
  INVESTIMENTOS_RENDIMENTOS = 'INVESTIMENTOS_RENDIMENTOS',
  EMPRESTIMOS_RECEBIDOS = 'EMPRESTIMOS_RECEBIDOS',
  OUTRAS_RECEITAS = 'OUTRAS_RECEITAS',
  // Despesas
  ALIMENTACAO = 'ALIMENTACAO',
  TRANSPORTE = 'TRANSPORTE',
  MORADIA = 'MORADIA',
  SAUDE = 'SAUDE',
  EDUCACAO = 'EDUCACAO',
  LAZER = 'LAZER',
  UTILIDADES = 'UTILIDADES',
  COMPRAS = 'COMPRAS',
  SERVICOS = 'SERVICOS',
  INVESTIMENTOS_APLICADOS = 'INVESTIMENTOS_APLICADOS',
  EMPRESTIMOS_PAGOS = 'EMPRESTIMOS_PAGOS',
  OUTRAS_DESPESAS = 'OUTRAS_DESPESAS',
  // Transferências
  TRANSFERENCIA_ENTRE_CONTAS = 'TRANSFERENCIA_ENTRE_CONTAS',
  // Investimentos
  POUPANCA = 'POUPANCA',
  CDB = 'CDB',
  FUNDOS = 'FUNDOS',
  ACOES = 'ACOES',
  CRIPTOMOEDAS = 'CRIPTOMOEDAS',
}

export enum StatusMovimentacao {
  PENDENTE = 'PENDENTE',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  ESTORNADA = 'ESTORNADA',
}

export enum FonteMovimentacao {
  MANUAL = 'MANUAL',
  IMPORTACAO_ARQUIVO = 'IMPORTACAO_ARQUIVO',
  API_BANCARIA = 'API_BANCARIA',
  TRANSFERENCIA_AUTOMATICA = 'TRANSFERENCIA_AUTOMATICA',
}

export interface MovimentacaoFinanceiraDTO {
  id?: number;
  tipoMovimentacao: TipoMovimentacao;
  valor: number;
  descricao: string;
  categoria: CategoriaFinanceira;
  dataMovimentacao: string;
  status?: StatusMovimentacao;
  fonteMovimentacao: FonteMovimentacao;
  observacoes?: string;
  contaId: number;
  arquivoOrigem?: string;
  identificadorExterno?: string;
  saldoAnterior?: number;
  saldoAtual?: number;
}

