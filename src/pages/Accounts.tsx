import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { accountsService } from '@/services/accounts.service';
import { transactionsService } from '@/services/transactions.service';
import { formatCurrency } from '@/utils/formatters';
import { TipoMovimentacao } from '@/types/transaction.types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { contaSchema } from '@/utils/validators';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import type { DadosContaDTO } from '@/types/account.types';

export const Accounts: React.FC = () => {
  const [contas, setContas] = useState<DadosContaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<DadosContaDTO | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<DadosContaDTO | null>(null);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [tamanhoPagina, setTamanhoPagina] = useState<number>(10);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DadosContaDTO>({
    resolver: yupResolver(contaSchema),
  });

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    try {
      setIsLoading(true);
      const [contasData, movimentacoesData] = await Promise.all([
        accountsService.listarContas(),
        transactionsService.listarMovimentacoes(),
      ]);

      const contasArray = Array.isArray(contasData) ? contasData : [];
      const movimentacoesArray = Array.isArray(movimentacoesData) ? movimentacoesData : [];

      const contasComSaldo = contasArray.map((conta) => {
        const movimentacoesConta = movimentacoesArray.filter(
          (m) => m.contaId === conta.id && m.status === 'CONCLUIDA'
        );

        const movimentoFactors: Record<TipoMovimentacao, number> = {
          [TipoMovimentacao.RECEITA]: 1,
          [TipoMovimentacao.DESPESA]: -1,
          [TipoMovimentacao.TRANSFERENCIA]: -1,
          [TipoMovimentacao.INVESTIMENTO]: -1,
        };

        const saldo = movimentacoesConta.reduce((acc, mov) => {
          const fator = movimentoFactors[mov.tipoMovimentacao] ?? 0;
          return acc + fator * mov.valor;
        }, 0);

        return {
          ...conta,
          saldo,
        };
      });

      setContas(contasComSaldo);
    } catch (error: any) {
      toast.error('Erro ao carregar contas');
      setContas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DadosContaDTO) => {
    try {
      if (editingConta?.id) {
        await accountsService.atualizarConta(editingConta.id, data);
        toast.success('Conta atualizada com sucesso!');
      } else {
        await accountsService.criarConta(data);
        toast.success('Conta criada com sucesso!');
      }
      setIsModalOpen(false);
      reset();
      setEditingConta(null);
      loadContas();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.mensagem || 'Erro ao salvar conta';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (conta: DadosContaDTO) => {
    setEditingConta(conta);
    reset(conta);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (conta: DadosContaDTO) => {
    setContaToDelete(conta);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contaToDelete?.id) return;

    try {
      await accountsService.deletarConta(contaToDelete.id);
      toast.success('Conta excluída com sucesso!');
      setIsDeleteModalOpen(false);
      setContaToDelete(null);
      loadContas();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.mensagem || 'Erro ao excluir conta';
      toast.error(errorMsg);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setContaToDelete(null);
  };

  const handleNew = () => {
    setEditingConta(null);
    reset({
      banco: '',
      numeroAgencia: '',
      numeroConta: '',
      tipoConta: '',
      responsavel: '',
    });
    setIsModalOpen(true);
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

  // Pega valores da paginação
  const total = contas?.length || 0;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina));
  const paginaSegura = Math.min(Math.max(1, paginaAtual), totalPaginas);
  const start = (paginaSegura - 1) * tamanhoPagina;
  const end = start + tamanhoPagina;
  const paginaItens = (contas || []).slice(start, end);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Contas Bancárias</h1>
          <Button onClick={handleNew}>
            <FiPlus className="mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Banco</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Agência</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Conta</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Tipo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Responsável</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Saldo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginaItens && paginaItens.length > 0 ? paginaItens.map((conta) => (
                  <tr key={conta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 border-b text-gray-900 font-medium">{conta.banco}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{conta.numeroAgencia}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{conta.numeroConta}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{conta.tipoConta}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{conta.responsavel}</td>
                    <td className="px-4 py-2 border-b text-blue-600 font-semibold">
                      {formatCurrency(conta.saldo || 0)}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(conta)}
                        >
                          <FiEdit className="mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteClick(conta)}
                        >
                          <FiTrash2 className="mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma conta encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {contas && contas.length > 0 && (
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
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
            setEditingConta(null);
          }}
          title={editingConta ? 'Editar Conta' : 'Nova Conta'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Banco"
              {...register('banco')}
              error={errors.banco?.message}
              required
            />

            <Input
              label="Número da Agência"
              {...register('numeroAgencia')}
              error={errors.numeroAgencia?.message}
              required
            />

            <Input
              label="Número da Conta"
              {...register('numeroConta')}
              error={errors.numeroConta?.message}
              required
            />

            <Input
              label="Tipo de Conta"
              {...register('tipoConta')}
              error={errors.tipoConta?.message}
              placeholder="Ex: Corrente, Poupança"
              required
            />

            <Input
              label="Responsável"
              {...register('responsavel')}
              error={errors.responsavel?.message}
              required
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                  setEditingConta(null);
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
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          title="Confirmar Exclusão"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Tem certeza que deseja excluir esta conta?
            </p>
            {contaToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {contaToDelete.banco}
                </p>
                <p className="text-xs text-gray-600">
                  Ag: {contaToDelete.numeroAgencia} | Conta: {contaToDelete.numeroConta}
                </p>
                <p className="text-xs text-gray-600">
                  Responsável: {contaToDelete.responsavel}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
