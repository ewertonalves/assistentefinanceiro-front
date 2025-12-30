import * as yup from 'yup';

export const registroUsuarioSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(1, 'Nome não pode estar vazio'),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  senha: yup.string().required('Senha é obrigatória').min(1, 'Senha é obrigatória'),
  role: yup.string().oneOf(['USER', 'ADMIN'], 'Role inválida').optional(),
});

export const loginSchema = yup.object({
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  senha: yup.string().required('Senha é obrigatória'),
});

export const contaSchema = yup.object({
  banco: yup.string().required('Banco é obrigatório').max(255, 'Banco deve ter no máximo 255 caracteres'),
  numeroAgencia: yup.string().required('Número da agência é obrigatório').max(255, 'Número da agência deve ter no máximo 255 caracteres'),
  numeroConta: yup.string().required('Número da conta é obrigatório').max(255, 'Número da conta deve ter no máximo 255 caracteres'),
  tipoConta: yup.string().required('Tipo de conta é obrigatório').max(255, 'Tipo de conta deve ter no máximo 255 caracteres'),
  responsavel: yup.string().required('Responsável é obrigatório').max(255, 'Responsável deve ter no máximo 255 caracteres'),
});

export const movimentacaoSchema = yup.object({
  tipoMovimentacao: yup.string().oneOf(['RECEITA', 'DESPESA', 'TRANSFERENCIA', 'INVESTIMENTO'], 'Tipo de movimentação inválido').required('Tipo de movimentação é obrigatório'),
  valor: yup.number().required('Valor é obrigatório').positive('Valor deve ser maior que zero'),
  descricao: yup.string().required('Descrição é obrigatória').max(500, 'Descrição deve ter no máximo 500 caracteres'),
  categoria: yup.string().required('Categoria é obrigatória'),
  dataMovimentacao: yup.string().required('Data da movimentação é obrigatória'),
  status: yup.string().oneOf(['PENDENTE', 'CONCLUIDA', 'CANCELADA', 'ESTORNADA']).optional(),
  fonteMovimentacao: yup.string().oneOf(['MANUAL', 'IMPORTACAO_ARQUIVO', 'API_BANCARIA', 'TRANSFERENCIA_AUTOMATICA'], 'Fonte de movimentação inválida').required('Fonte de movimentação é obrigatória'),
  observacoes: yup.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
  contaId: yup.number().required('Conta é obrigatória').positive('Conta inválida'),
  arquivoOrigem: yup.string().max(100).nullable().optional(),
  identificadorExterno: yup.string().max(50).nullable().optional(),
});

export const metaSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório').max(200, 'Nome deve ter no máximo 200 caracteres'),
  descricao: yup.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
  tipoMeta: yup.string().required('Tipo de meta é obrigatório'),
  valorMeta: yup.number().required('Valor da meta é obrigatório').positive('Valor da meta deve ser maior que zero'),
  valorAtual: yup.number().min(0).optional(),
  dataInicio: yup.string().required('Data de início é obrigatória'),
  dataFim: yup.string().required('Data de fim é obrigatória').test('is-after-start', 'Data de fim deve ser posterior à data de início', (value: string | undefined, context: any) => {
    const { dataInicio } = context.parent as { dataInicio?: string };
    if (!dataInicio || !value) return true;
    return new Date(value) > new Date(dataInicio);
  }),
  status: yup.string().oneOf(['ATIVA', 'CONCLUIDA', 'PAUSADA', 'CANCELADA', 'VENCIDA']).optional(),
  observacoes: yup.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
  contaId: yup.number().required('Conta é obrigatória').positive('Conta inválida'),
});

export const atualizarProgressoSchema = yup.object({
  valorAdicionado: yup.number().required('Valor é obrigatório').positive('Valor deve ser maior que zero'),
});

