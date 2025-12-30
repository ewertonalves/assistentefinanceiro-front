import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { transactionsService } from '@/services/transactions.service';
import { getLastBackendMessage, clearLastBackendMessage } from '@/services/api';
import { accountsService } from '@/services/accounts.service';
import { formatCurrency, formatDate, formatDateInput } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { movimentacaoSchema } from '@/utils/validators';
import {
  TIPOS_MOVIMENTACAO,
  CATEGORIAS_RECEITA,
  CATEGORIAS_DESPESA,
  CATEGORIAS_TRANSFERENCIA,
  CATEGORIAS_INVESTIMENTO,
  FONTES_MOVIMENTACAO,
  STATUS_MOVIMENTACAO,
} from '@/utils/constants';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiRotateCcw, FiFileText } from 'react-icons/fi';
import type { MovimentacaoFinanceiraDTO } from '@/types/transaction.types';
import { TipoMovimentacao, StatusMovimentacao as StatusEnum, FonteMovimentacao as FonteEnum } from '@/types/transaction.types';
import type { DadosContaDTO } from '@/types/account.types';

export const Transactions: React.FC = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceiraDTO[]>([]);
  const [contas, setContas] = useState<DadosContaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoFinanceiraDTO | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoMovimentacao | ''>('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [movimentacaoIdParaExcluir, setMovimentacaoIdParaExcluir] = useState<number | null>(null);
  const [isConfirmRevertOpen, setIsConfirmRevertOpen] = useState(false);
  const [movimentacaoIdParaEstornar, setMovimentacaoIdParaEstornar] = useState<number | null>(null);
  const [filtroContaId, setFiltroContaId] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [tamanhoPagina, setTamanhoPagina] = useState<number>(10);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MovimentacaoFinanceiraDTO>({
    resolver: yupResolver(movimentacaoSchema) as any,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      tipoMovimentacao: TipoMovimentacao.RECEITA,
      valor: 0,
      descricao: '',
      categoria: 'SALARIO' as any,
      dataMovimentacao: new Date().toISOString().split('T')[0],
      status: StatusEnum.CONCLUIDA,
      fonteMovimentacao: FonteEnum.MANUAL,
      contaId: undefined as any,
    },
  });

  const tipoMovimentacao = watch('tipoMovimentacao');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTipoSelecionado(tipoMovimentacao as TipoMovimentacao);
  }, [tipoMovimentacao]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('[Transactions] Carregando dados...');
      const [movimentacoesData, contasData] = await Promise.all([
        transactionsService.listarMovimentacoes(),
        accountsService.listarContas(),
      ]);
      setMovimentacoes(Array.isArray(movimentacoesData) ? movimentacoesData : []);
      setContas(Array.isArray(contasData) ? contasData : []);
      console.log('[Transactions] Dados carregados', { movimentacoesCount: movimentacoesData?.length, contasCount: contasData?.length });
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
      setMovimentacoes([]);
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoriaOptionsByType = (tipo: TipoMovimentacao | '') => {
    if (!tipo) return [];
    switch (tipo) {
      case 'RECEITA':
        return CATEGORIAS_RECEITA;
      case 'DESPESA':
        return CATEGORIAS_DESPESA;
      case 'TRANSFERENCIA':
        return CATEGORIAS_TRANSFERENCIA;
      case 'INVESTIMENTO':
        return CATEGORIAS_INVESTIMENTO;
      default:
        return [];
    }
  };

  const getCategoriaOptions = () => getCategoriaOptionsByType(tipoSelecionado);

  useEffect(() => {
    const options = getCategoriaOptionsByType(tipoSelecionado);
    const currentCategoria = (watch('categoria') as unknown) as string | undefined;
    const exists = options.some((opt) => opt.value === currentCategoria);
    if (!exists && options.length > 0) {
      setValue('categoria', options[0].value as any, { shouldValidate: true });
    }
    console.log('[Transactions] Tipo mudou', { tipoSelecionado, currentCategoria, categoriaOptions: options });
  }, [tipoSelecionado]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroContaId, filtroTipo, filtroDataInicio, filtroDataFim]);

  const onSubmit = async (data: MovimentacaoFinanceiraDTO) => {
    try {
      console.log('[Transactions] onSubmit', { editingId: editingMovimentacao?.id, data });
      const { arquivoOrigem, identificadorExterno, id: _id, saldoAnterior, saldoAtual, ...payload } = data as any;
      const normalizedPayload = {
        ...payload,
      } as MovimentacaoFinanceiraDTO;
      console.log('[Transactions] Payload base', normalizedPayload);
      if (editingMovimentacao?.id) {
        console.log('[Transactions] Chamando atualizarMovimentacao');
        const payloadWithId = { ...normalizedPayload, id: editingMovimentacao.id } as MovimentacaoFinanceiraDTO;
        console.log('[Transactions] Payload PUT', payloadWithId);
        await transactionsService.atualizarMovimentacao(editingMovimentacao.id, payloadWithId);
        const msgUpdate = getLastBackendMessage();
        toast.success(msgUpdate || 'Movimentação atualizada com sucesso!');
        clearLastBackendMessage();
      } else {
        console.log('[Transactions] Chamando criarMovimentacao');
        console.log('[Transactions] Payload POST', normalizedPayload);
        await transactionsService.criarMovimentacao(normalizedPayload);
        const msgCreate = getLastBackendMessage();
        toast.success(msgCreate || 'Movimentação criada com sucesso!');
        clearLastBackendMessage();
      }
      setIsModalOpen(false);
      reset();
      setEditingMovimentacao(null);
      loadData();
    } catch (error: any) {
      console.error('[Transactions] Erro no submit', error);
      const errorMsg =
        error.response?.data?.mensagem || 'Erro ao salvar movimentação';
      toast.error(errorMsg);
    }
  };

  const onInvalid = (errors: any) => {
    console.warn('[Transactions] Validação falhou', errors);
  };

  const handleEdit = (movimentacao: MovimentacaoFinanceiraDTO) => {
    console.log('[Transactions] handleEdit', movimentacao);
    setEditingMovimentacao(movimentacao);
    setTipoSelecionado(movimentacao.tipoMovimentacao);
    const categoriaOptions = getCategoriaOptionsByType(movimentacao.tipoMovimentacao);
    const categoriaValida = categoriaOptions.some((o) => o.value === (movimentacao.categoria as any))
      ? movimentacao.categoria
      : (categoriaOptions[0]?.value as any);
    const { arquivoOrigem, identificadorExterno, id: _id, saldoAnterior, saldoAtual, ...rest } = movimentacao as any;
    const editValues = {
      ...(rest as MovimentacaoFinanceiraDTO),
      contaId: (movimentacao.contaId as unknown as string) as any,
      dataMovimentacao: formatDateInput(movimentacao.dataMovimentacao),
      categoria: categoriaValida,
    };
    console.log('[Transactions] reset form with', editValues);
    reset(editValues);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setMovimentacaoIdParaExcluir(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!movimentacaoIdParaExcluir) return;
    try {
      await transactionsService.deletarMovimentacao(movimentacaoIdParaExcluir);
      const msgDelete = getLastBackendMessage();
      toast.success(msgDelete || 'Movimentação excluída com sucesso!');
      clearLastBackendMessage();
      setIsConfirmDeleteOpen(false);
      setMovimentacaoIdParaExcluir(null);
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao excluir movimentação';
      toast.error(errorMsg);
    }
  };

  const handleEstornar = (id: number) => {
    setMovimentacaoIdParaEstornar(id);
    setIsConfirmRevertOpen(true);
  };

  const confirmarEstorno = async () => {
    if (!movimentacaoIdParaEstornar) return;
    try {
      await transactionsService.estornarMovimentacao(movimentacaoIdParaEstornar);
      const msgRevert = getLastBackendMessage();
      toast.success(msgRevert || 'Movimentação estornada com sucesso!');
      clearLastBackendMessage();
      setIsConfirmRevertOpen(false);
      setMovimentacaoIdParaEstornar(null);
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao estornar movimentação';
      toast.error(errorMsg);
    }
  };

  const handleNew = () => {
    setEditingMovimentacao(null);
    setTipoSelecionado(TipoMovimentacao.RECEITA);
    const defaultValues: Partial<MovimentacaoFinanceiraDTO> = {
      tipoMovimentacao: TipoMovimentacao.RECEITA,
      valor: 0,
      descricao: '',
      categoria: 'SALARIO' as any,
      dataMovimentacao: new Date().toISOString().split('T')[0],
      status: StatusEnum.CONCLUIDA,
      fonteMovimentacao: FonteEnum.MANUAL,
      contaId: contas.length > 0 ? contas[0].id! : undefined as any,
      observacoes: '',
    };
    reset(defaultValues);
    setIsModalOpen(true);
  };

  const contaOptions = contas.map((conta) => ({
    value: conta.id!.toString(),
    label: `${conta.banco} - ${conta.numeroConta}`,
  }));

  const aplicarFiltros = async () => {
    try {
      console.log('[Transactions] aplicarFiltros -> valores atuais', {
        filtroContaId,
        filtroTipo,
        filtroDataInicio,
        filtroDataFim,
      });
      let baseLista = [] as MovimentacaoFinanceiraDTO[];
      let aplicouServer = false;

      if (filtroContaId) {
        const contaIdNum = Number(filtroContaId);
        if (filtroDataInicio && filtroDataFim) {
          console.log('[Transactions] aplicarFiltros -> conta + periodo', { contaIdNum, filtroDataInicio, filtroDataFim });
          baseLista = await transactionsService.listarPorPeriodo(contaIdNum, filtroDataInicio, filtroDataFim);
          aplicouServer = true;
        } else if (filtroTipo) {
          console.log('[Transactions] aplicarFiltros -> conta + tipo', { contaIdNum, filtroTipo });
          baseLista = await transactionsService.listarPorContaETipo(contaIdNum, filtroTipo);
          aplicouServer = true;
        } else {
          console.log('[Transactions] aplicarFiltros -> apenas conta', { contaIdNum });
          baseLista = await transactionsService.listarPorConta(contaIdNum);
        }
      } else {
        console.log('[Transactions] aplicarFiltros -> sem conta: listarMovimentacoes()');
        baseLista = await transactionsService.listarMovimentacoes();
      }

      console.log('[Transactions] aplicarFiltros -> base obtida', { count: baseLista?.length, aplicouServer });

      let filtrada = [...baseLista];

      if (filtroTipo && !aplicouServer) {
        filtrada = filtrada.filter((m) => (m as any).tipoMovimentacao === filtroTipo);
        console.log('[Transactions] aplicarFiltros -> filtro cliente tipo', { count: filtrada.length });
      }

      if (filtroDataInicio || filtroDataFim) {
        const inicioTime = filtroDataInicio ? new Date(filtroDataInicio + 'T00:00:00').getTime() : Number.NEGATIVE_INFINITY;
        const fimTime = filtroDataFim ? new Date(filtroDataFim + 'T23:59:59').getTime() : Number.POSITIVE_INFINITY;
        filtrada = filtrada.filter((m) => {
          const t = new Date((m as any).dataMovimentacao).getTime();
          return t >= inicioTime && t <= fimTime;
        });
        console.log('[Transactions] aplicarFiltros -> filtro cliente periodo', { count: filtrada.length, inicioTime, fimTime });
      }

      setMovimentacoes(filtrada);
      console.log('[Transactions] aplicarFiltros -> resultado final', { count: filtrada?.length });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.mensagem || 'Erro ao aplicar filtros';
      console.error('[Transactions] aplicarFiltros -> erro', error);
      toast.error(errorMsg);
    }
  };

  const limparFiltros = async () => {
    console.log('[Transactions] limparFiltros');
    setFiltroContaId('');
    setFiltroTipo('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    await aplicarFiltros();
  };

  const handleGerarPDF = async () => {
    try {
      if (!filtroContaId) {
        toast.error('Por favor, selecione uma conta para gerar o relatório PDF');
        return;
      }

      const contaId = Number(filtroContaId);
      if (isNaN(contaId) || contaId <= 0) {
        toast.error('Conta inválida');
        return;
      }

      const parametros: any = {
        contaId,
        incluirResumo: true,
        tituloRelatorio: 'Relatório de Movimentações Financeiras',
      };

      if (filtroDataInicio) {
        parametros.dataInicio = filtroDataInicio;
      }

      if (filtroDataFim) {
        parametros.dataFim = filtroDataFim;
      }

      if (filtroTipo) {
        parametros.tipoMovimentacao = filtroTipo;
      }

      console.log('[Transactions] Buscando dados do relatório com parâmetros', parametros);
      
      const dados = await transactionsService.buscarDadosRelatorio(parametros);
      
      const { gerarPDF } = await import('@/utils/pdfGenerator');
      await gerarPDF(dados);

      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error: any) {
      console.error('[Transactions] Erro ao gerar PDF', error);
      const errorMsg = error.response?.data?.mensagem || error.message || 'Erro ao gerar relatório PDF';
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Movimentações Financeiras</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleGerarPDF}>
              <FiFileText className="mr-2" />
              Gerar PDF
            </Button>
            <Button onClick={handleNew}>
              <FiPlus className="mr-2" />
              Nova Movimentação
            </Button>
          </div>
      </div>
    <br />
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <Select
                label="Conta (filtro)"
                options={[{ value: '', label: 'Todas' }, ...contaOptions]}
                value={filtroContaId}
                onChange={(e: any) => {
                  const value = e?.target ? e.target.value : e;
                  console.log('[Transactions] filtroContaId change', value);
                  setFiltroContaId(value);
                }}
              />
            </div>
            <div>
              <Select
                label="Tipo (filtro)"
                options={[{ value: '', label: 'Todos' }, ...TIPOS_MOVIMENTACAO]}
                value={filtroTipo}
                onChange={(e: any) => {
                  const value = e?.target ? e.target.value : e;
                  console.log('[Transactions] filtroTipo change', value);
                  setFiltroTipo(value);
                }}
              />
            </div>
            <div>
              <Input
                label="Início"
                type="date"
                value={filtroDataInicio}
                onChange={(e) => {
                  console.log('[Transactions] filtroDataInicio change', e.target.value);
                  setFiltroDataInicio(e.target.value);
                }}
              />
            </div>
            <div>
              <Input
                label="Fim"
                type="date"
                value={filtroDataFim}
                onChange={(e) => {
                  console.log('[Transactions] filtroDataFim change', e.target.value);
                  setFiltroDataFim(e.target.value);
                }}
              />
            </div>
            <div className="flex gap-2 md:justify-end">
              <Button type="button" variant="secondary" onClick={limparFiltros}>
                Limpar
              </Button>
              <Button type="button" onClick={aplicarFiltros}>
                Filtrar
              </Button>
            </div>
          </div>
        </div>
        

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const total = movimentacoes?.length || 0;
                const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina));
                const paginaSegura = Math.min(Math.max(1, paginaAtual), totalPaginas);
                const start = (paginaSegura - 1) * tamanhoPagina;
                const end = start + tamanhoPagina;
                const paginaItens = (movimentacoes || []).slice(start, end);
                return paginaItens && paginaItens.length > 0 ? paginaItens.map((mov) => (
                <tr key={mov.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(mov.dataMovimentacao)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        mov.tipoMovimentacao === 'RECEITA'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mov.tipoMovimentacao}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {mov.descricao}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {mov.categoria}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {mov.tipoMovimentacao === 'RECEITA' ? (
                      <span className="text-green-600">
                        +{formatCurrency(mov.valor)}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        -{formatCurrency(mov.valor)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        mov.status === 'CONCLUIDA'
                          ? 'bg-green-100 text-green-800'
                          : mov.status === 'PENDENTE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : mov.status === 'CANCELADA'
                          ? 'bg-red-100 text-red-800'
                          : mov.status === 'ESTORNADA'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {mov.status || 'CONCLUIDA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(mov)}
                        className="px-2 py-1"
                      >
                        <FiEdit />
                      </Button>
                      {mov.status !== 'ESTORNADA' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleEstornar(mov.id!)}
                          className="px-2 py-1"
                        >
                          <FiRotateCcw />
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(mov.id!)}
                        className="px-2 py-1"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                </tr>
              );
              })()}
            </tbody>
          </table>

          {(!movimentacoes || movimentacoes.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              Nenhuma movimentação encontrada
            </div>
          )}
        </div>
        {movimentacoes && movimentacoes.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t">
            <div className="w-40">
              <Select
                label="Itens por página"
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                ]}
                value={String(tamanhoPagina)}
                onChange={(e: any) => {
                  const value = Number(e?.target ? e.target.value : e);
                  setTamanhoPagina(value || 10);
                  setPaginaAtual(1);
                }}
              />
            </div>
            {(() => {
              const total = movimentacoes?.length || 0;
              const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina));
              const paginaSegura = Math.min(Math.max(1, paginaAtual), totalPaginas);
              return (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1"
                    onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                    disabled={paginaSegura === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {paginaSegura} de {totalPaginas}
                  </span>
                  <Button
                    type="button"
                    className="px-3 py-1"
                    onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaSegura === totalPaginas}
                  >
                    Próxima
                  </Button>
                </div>
              );
            })()}
          </div>
        )}

        <Modal
          isOpen={isConfirmDeleteOpen}
          onClose={() => {
            setIsConfirmDeleteOpen(false);
            setMovimentacaoIdParaExcluir(null);
          }}
          title="Confirmar exclusão"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-gray-700">Tem certeza que deseja excluir esta movimentação?</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsConfirmDeleteOpen(false);
                  setMovimentacaoIdParaExcluir(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                type="button"
                onClick={confirmarExclusao}
              >
                OK
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isConfirmRevertOpen}
          onClose={() => {
            setIsConfirmRevertOpen(false);
            setMovimentacaoIdParaEstornar(null);
          }}
          title="Confirmar estorno"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-gray-700">Tem certeza que deseja estornar esta movimentação?</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="danger"
                type="button"
                onClick={() => {
                  setIsConfirmRevertOpen(false);
                  setMovimentacaoIdParaEstornar(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                type="button"
                onClick={confirmarEstorno}
              >
                OK
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
            setEditingMovimentacao(null);
          }}
          title={editingMovimentacao ? 'Editar Movimentação' : 'Nova Movimentação'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <Select
              label="Conta"
              options={contaOptions}
              {...register('contaId', {
                setValueAs: (v) => (v === '' || v === undefined ? undefined : Number(v)),
                required: false,
              })}
              error={errors.contaId?.message}
              required
            />

            <Select
              label="Tipo de Movimentação"
              options={TIPOS_MOVIMENTACAO}
              {...register('tipoMovimentacao', { required: false })}
              error={errors.tipoMovimentacao?.message}
              required
            />

            {tipoSelecionado && (
              <Select
                label="Categoria"
                options={getCategoriaOptions()}
                {...register('categoria')}
                error={errors.categoria?.message}
                required
              />
            )}

            <CurrencyInput
              label="Valor"
              value={watch('valor')}
              onChange={(value) => setValue('valor', value || 0, { shouldValidate: true })}
              error={errors.valor?.message}
              required
            />

            <Input
              label="Descrição"
              {...register('descricao')}
              error={errors.descricao?.message}
              required
            />

            <Input
              label="Data da Movimentação"
              type="date"
              {...register('dataMovimentacao')}
              error={errors.dataMovimentacao?.message}
              required
            />

            <Select
              label="Status"
              options={STATUS_MOVIMENTACAO}
              {...register('status', { required: false })}
              error={errors.status?.message}
            />

            <Select
              label="Fonte da Movimentação"
              options={FONTES_MOVIMENTACAO}
              {...register('fonteMovimentacao', { required: false })}
              error={errors.fonteMovimentacao?.message}
              required
            />

            <Textarea
              label="Observações"
              rows={3}
              {...register('observacoes')}
              error={errors.observacoes?.message}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                  setEditingMovimentacao(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Salvar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

