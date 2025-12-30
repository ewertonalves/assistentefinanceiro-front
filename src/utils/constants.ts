export const API_BASE_URL = 'http://localhost:8080';

export const TOKEN_STORAGE_KEY = 'assistente_financeiro_token';
export const USER_STORAGE_KEY = 'assistente_financeiro_usuario';

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const TIPOS_MOVIMENTACAO = [
  { value: 'RECEITA', label: 'Receita' },
  { value: 'DESPESA', label: 'Despesa' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
  { value: 'INVESTIMENTO', label: 'Investimento' },
];

export const CATEGORIAS_RECEITA = [
  { value: 'SALARIO', label: 'Salário' },
  { value: 'VENDAS', label: 'Vendas' },
  { value: 'INVESTIMENTOS_RENDIMENTOS', label: 'Investimentos/Rendimentos' },
  { value: 'EMPRESTIMOS_RECEBIDOS', label: 'Empréstimos Recebidos' },
  { value: 'OUTRAS_RECEITAS', label: 'Outras Receitas' },
];

export const CATEGORIAS_DESPESA = [
  { value: 'ALIMENTACAO', label: 'Alimentação' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'MORADIA', label: 'Moradia' },
  { value: 'SAUDE', label: 'Saúde' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'LAZER', label: 'Lazer' },
  { value: 'UTILIDADES', label: 'Utilidades' },
  { value: 'COMPRAS', label: 'Compras' },
  { value: 'SERVICOS', label: 'Serviços' },
  { value: 'INVESTIMENTOS_APLICADOS', label: 'Investimentos Aplicados' },
  { value: 'EMPRESTIMOS_PAGOS', label: 'Empréstimos Pagos' },
  { value: 'OUTRAS_DESPESAS', label: 'Outras Despesas' },
];

export const CATEGORIAS_TRANSFERENCIA = [
  { value: 'TRANSFERENCIA_ENTRE_CONTAS', label: 'Transferência entre Contas' },
];

export const CATEGORIAS_INVESTIMENTO = [
  { value: 'POUPANCA', label: 'Poupança' },
  { value: 'CDB', label: 'CDB' },
  { value: 'FUNDOS', label: 'Fundos' },
  { value: 'ACOES', label: 'Ações' },
  { value: 'CRIPTOMOEDAS', label: 'Criptomoedas' },
];

export const STATUS_MOVIMENTACAO = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'ESTORNADA', label: 'Estornada' },
];

export const FONTES_MOVIMENTACAO = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'IMPORTACAO_ARQUIVO', label: 'Importação de Arquivo' },
  { value: 'API_BANCARIA', label: 'API Bancária' },
  { value: 'TRANSFERENCIA_AUTOMATICA', label: 'Transferência Automática' },
];

export const TIPOS_META = [
  { value: 'ECONOMIA_MENSAL', label: 'Economia Mensal' },
  { value: 'ECONOMIA_ANUAL', label: 'Economia Anual' },
  { value: 'RESERVA_EMERGENCIA', label: 'Reserva de Emergência' },
  { value: 'INVESTIMENTO_ESPECIFICO', label: 'Investimento Específico' },
  { value: 'COMPRA_OBJETO', label: 'Compra de Objeto' },
  { value: 'VIAGEM', label: 'Viagem' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'SAUDE', label: 'Saúde' },
  { value: 'OUTROS', label: 'Outros' },
];

export const STATUS_META = [
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'PAUSADA', label: 'Pausada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'VENCIDA', label: 'Vencida' },
];

export const PERGUNTAS_RAPIDAS_IA = [
  'Analisar minha situação financeira',
  'Sugestões de economia',
  'Planejamento para aposentadoria',
  'Como aumentar minha reserva de emergência?',
  'Melhores investimentos para meu perfil',
];

