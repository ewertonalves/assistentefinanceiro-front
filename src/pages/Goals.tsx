import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { goalsService } from '@/services/goals.service';
import { accountsService } from '@/services/accounts.service';
import { aiService } from '@/services/ai.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { metaSchema } from '@/utils/validators';
import { TIPOS_META, STATUS_META } from '@/utils/constants';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiPlay, FiPause, FiTarget } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MetaEconomiaDTO } from '@/types/goal.types';
import { StatusMeta } from '@/types/goal.types';
import type { DadosContaDTO } from '@/types/account.types';

export const Goals: React.FC = () => {
  const [metas, setMetas] = useState<MetaEconomiaDTO[]>([]);
  const [contas, setContas] = useState<DadosContaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isViabilidadeModalOpen, setIsViabilidadeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaEconomiaDTO | null>(null);
  const [metaToDelete, setMetaToDelete] = useState<MetaEconomiaDTO | null>(null);
  const [planoAcao, setPlanoAcao] = useState<string>('');
  const [analiseViabilidade, setAnaliseViabilidade] = useState<string>('');
  const [isLoadingIA, setIsLoadingIA] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaEconomiaDTO | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MetaEconomiaDTO>({
    resolver: yupResolver(metaSchema) as any,
    defaultValues: {
      status: StatusMeta.ATIVA,
      valorAtual: 0,
    },
  });

  const progressForm = useForm<{ valorAdicionado: number }>({
    defaultValues: { valorAdicionado: 0 },
  });

  const { watch: watchProgress, setValue: setValueProgress } = progressForm;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [metasData, contasData] = await Promise.all([
        goalsService.listarMetas(),
        accountsService.listarContas(),
      ]);
      setMetas(Array.isArray(metasData) ? metasData : []);
      setContas(Array.isArray(contasData) ? contasData : []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
      setMetas([]);
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MetaEconomiaDTO) => {
    try {
      if (editingMeta?.id) {
        await goalsService.atualizarMeta(editingMeta.id, data);
        toast.success('Meta atualizada com sucesso!');
      } else {
        await goalsService.criarMeta(data);
        toast.success('Meta criada com sucesso!');
      }
      setIsModalOpen(false);
      reset();
      setEditingMeta(null);
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao salvar meta';
      toast.error(errorMsg);
    }
  };

  const onSubmitProgress = async (data: { valorAdicionado: number }) => {
    if (!selectedMeta) return;
    try {
      await goalsService.atualizarProgresso(selectedMeta.id!, data);
      toast.success('Progresso atualizado com sucesso!');
      setIsProgressModalOpen(false);
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao atualizar progresso';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (meta: MetaEconomiaDTO) => {
    setEditingMeta(meta);
    reset(meta);
    setIsModalOpen(true);
  };

  const handleDelete = (meta: MetaEconomiaDTO) => {
    setMetaToDelete(meta);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!metaToDelete?.id) return;

    try {
      await goalsService.deletarMeta(metaToDelete.id);
      toast.success('Meta excluída com sucesso!');
      setIsDeleteModalOpen(false);
      setMetaToDelete(null);
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao excluir meta';
      toast.error(errorMsg);
    }
  };

  const handlePausar = async (id: number) => {
    try {
      await goalsService.pausarMeta(id);
      toast.success('Meta pausada com sucesso!');
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao pausar meta';
      toast.error(errorMsg);
    }
  };

  const handleReativar = async (id: number) => {
    try {
      await goalsService.reativarMeta(id);
      toast.success('Meta reativada com sucesso!');
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao reativar meta';
      toast.error(errorMsg);
    }
  };

  const handleGerarPlanoAcao = async (meta: MetaEconomiaDTO) => {
    setSelectedMeta(meta);
    setIsLoadingIA(true);
    setIsPlanModalOpen(true);

    try {
      const plano = await aiService.gerarPlanoAcao(meta.id!);
      setPlanoAcao(plano);
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao gerar plano de ação';
      toast.error(errorMsg);
      setPlanoAcao('Erro ao gerar plano de ação.');
    } finally {
      setIsLoadingIA(false);
    }
  };

  const handleAnalisarViabilidade = async (data: MetaEconomiaDTO) => {
    setIsLoadingIA(true);
    setIsViabilidadeModalOpen(true);

    try {
      const analise = await aiService.analisarViabilidade(data);
      setAnaliseViabilidade(analise);
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || 'Erro ao analisar viabilidade';
      toast.error(errorMsg);
      setAnaliseViabilidade('Erro ao analisar viabilidade.');
    } finally {
      setIsLoadingIA(false);
    }
  };

  const handleNew = () => {
    setEditingMeta(null);
    reset({
      nome: '',
      descricao: '',
      tipoMeta: 'ECONOMIA_MENSAL' as any,
      valorMeta: 0,
      valorAtual: 0,
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      status: StatusMeta.ATIVA,
      contaId: 0,
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: StatusMeta) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-blue-100 text-blue-800';
      case 'CONCLUIDA':
        return 'bg-green-100 text-green-800';
      case 'PAUSADA':
        return 'bg-yellow-100 text-yellow-800';
      case 'VENCIDA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoMetaLabel = (tipoMeta: string) => {
    const tipo = TIPOS_META.find((t) => t.value === tipoMeta);
    return tipo ? tipo.label : tipoMeta;
  };

  const contaOptions = contas.map((conta) => ({
    value: conta.id!.toString(),
    label: `${conta.banco} - ${conta.numeroConta}`,
  }));

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Metas de Economia</h1>
          <Button onClick={handleNew}>
            <FiPlus className="mr-2" />
            Nova Meta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metas && metas.length > 0 ? metas.map((meta) => (
            <div
              key={meta.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{meta.nome}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(meta.status!)}`}>
                  {meta.status}
                </span>
              </div>

              {meta.descricao && (
                <p className="text-sm text-gray-600 mb-4">{meta.descricao}</p>
              )}

              <div className="mb-4">
                <ProgressBar
                  value={meta.valorAtual || 0}
                  max={meta.valorMeta}
                  showPercentage
                  color={meta.percentualConcluido! >= 100 ? 'green' : 'blue'}
                />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Meta:</strong> {formatCurrency(meta.valorMeta)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Atual:</strong> {formatCurrency(meta.valorAtual || 0)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Prazo:</strong> {formatDate(meta.dataFim)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tipo:</strong> {getTipoMetaLabel(meta.tipoMeta)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedMeta(meta);
                    setIsProgressModalOpen(true);
                  }}
                  className="text-xs"
                >
                  Progresso
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleGerarPlanoAcao(meta)}
                  className="text-xs"
                >
                  <FiTarget className="mr-1" />
                  Plano IA
                </Button>
                {meta.status === 'PAUSADA' ? (
                  <Button
                    variant="success"
                    onClick={() => handleReativar(meta.id!)}
                    className="text-xs"
                  >
                    <FiPlay className="mr-1" />
                    Reativar
                  </Button>
                ) : (
                  meta.status === 'ATIVA' && (
                    <Button
                      variant="secondary"
                      onClick={() => handlePausar(meta.id!)}
                      className="text-xs"
                    >
                      <FiPause className="mr-1" />
                      Pausar
                    </Button>
                  )
                )}
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(meta)}
                  className="text-xs"
                >
                  <FiEdit className="mr-1" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(meta)}
                  className="text-xs"
                >
                  <FiTrash2 className="mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          )) : null}
        </div>

        {(!metas || metas.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhuma meta cadastrada</p>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
            setEditingMeta(null);
          }}
          title={editingMeta ? 'Editar Meta' : 'Nova Meta'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome"
              {...register('nome')}
              error={errors.nome?.message}
              required
            />

            <Textarea
              label="Descrição"
              rows={3}
              {...register('descricao')}
              error={errors.descricao?.message}
            />

            <Select
              label="Tipo de Meta"
              options={TIPOS_META}
              {...register('tipoMeta')}
              error={errors.tipoMeta?.message}
              required
            />

            <Select
              label="Conta"
              options={contaOptions}
              {...register('contaId', { valueAsNumber: true })}
              error={errors.contaId?.message}
              required
            />

            <CurrencyInput
              label="Valor da Meta"
              value={watch('valorMeta')}
              onChange={(value) => setValue('valorMeta', value || 0, { shouldValidate: true })}
              error={errors.valorMeta?.message}
              required
            />

            <Input
              label="Data de Início"
              type="date"
              {...register('dataInicio')}
              error={errors.dataInicio?.message}
              required
            />

            <Input
              label="Data de Fim"
              type="date"
              {...register('dataFim')}
              error={errors.dataFim?.message}
              required
            />

            <Select
              label="Status"
              options={STATUS_META}
              {...register('status')}
              error={errors.status?.message}
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
                onClick={async () => {
                  const formData = watch();
                  await handleAnalisarViabilidade(formData as MetaEconomiaDTO);
                }}
                disabled={!watch('nome') || !watch('valorMeta')}
              >
                Analisar Viabilidade (IA)
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                  setEditingMeta(null);
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

        <Modal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          title="Atualizar Progresso"
        >
          <form onSubmit={progressForm.handleSubmit(onSubmitProgress)} className="space-y-4">
            <CurrencyInput
              label="Valor Adicionado"
              value={watchProgress('valorAdicionado')}
              onChange={(value) => setValueProgress('valorAdicionado', value || 0, { shouldValidate: true })}
              required
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsProgressModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          title="Plano de Ação"
          size="xl"
        >
          {isLoadingIA ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{planoAcao}</ReactMarkdown>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isViabilidadeModalOpen}
          onClose={() => setIsViabilidadeModalOpen(false)}
          title="Análise de Viabilidade"
          size="xl"
        >
          {isLoadingIA ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analiseViabilidade}
              </ReactMarkdown>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setMetaToDelete(null);
          }}
          title="Confirmar Exclusão"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja excluir a meta <strong>"{metaToDelete?.nome}"</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMetaToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmDelete}
              >
                <FiTrash2 className="mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

