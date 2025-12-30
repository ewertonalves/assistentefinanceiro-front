import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { accountsService } from '@/services/accounts.service';
import { transactionsService } from '@/services/transactions.service';
import { goalsService } from '@/services/goals.service';
import { formatCurrency } from '@/utils/formatters';
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, CATEGORIAS_TRANSFERENCIA, CATEGORIAS_INVESTIMENTO } from '@/utils/constants';
import { TipoMovimentacao } from '@/types/transaction.types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';

interface DashboardData {
  saldoTotal: number;
  receitasMes: number;
  despesasMes: number;
  metasAtivas: number;
  metasVencidas: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    saldoTotal: 0,
    receitasMes: 0,
    despesasMes: 0,
    metasAtivas: 0,
    metasVencidas: 0,
  });
  const [receitasDespesasData, setReceitasDespesasData] = useState<any[]>([]);
  const [categoriaData, setCategoriaData] = useState<any[]>([]);
  const [movimentacoesRecentes, setMovimentacoesRecentes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [contas, movimentacoes, metas] = await Promise.all([
        accountsService.listarContas(),
        transactionsService.listarMovimentacoes(),
        goalsService.listarMetas(),
      ]);

      const contasArray = Array.isArray(contas) ? contas : [];
      const movimentacoesArray = Array.isArray(movimentacoes) ? movimentacoes : [];
      const metasArray = Array.isArray(metas) ? metas : [];

      const movimentoFactors: Record<TipoMovimentacao, number> = {
        [TipoMovimentacao.RECEITA]: 1,
        [TipoMovimentacao.DESPESA]: -1,
        [TipoMovimentacao.TRANSFERENCIA]: -1,
        [TipoMovimentacao.INVESTIMENTO]: -1,
      };

      const saldoTotal = contasArray.reduce((total, conta) => {
        const movimentacoesConta = movimentacoesArray.filter(
          (m) => m.contaId === conta.id && m.status === 'CONCLUIDA'
        );

        const saldoConta = movimentacoesConta.reduce((acc, mov) => {
          const fator = movimentoFactors[mov.tipoMovimentacao] ?? 0;
          return acc + fator * mov.valor;
        }, 0);

        return total + saldoConta;
      }, 0);

      // Entrada: apenas RECEITA
      const entradasGerais = movimentacoesArray
        .filter((m) => m.status === 'CONCLUIDA' && m.tipoMovimentacao === TipoMovimentacao.RECEITA)
        .reduce((sum, m) => sum + m.valor, 0);

      const saidasGerais = movimentacoesArray
        .filter((m) => m.status === 'CONCLUIDA' && (
          m.tipoMovimentacao === TipoMovimentacao.DESPESA ||
          m.tipoMovimentacao === TipoMovimentacao.TRANSFERENCIA ||
          m.tipoMovimentacao === TipoMovimentacao.INVESTIMENTO
        ))
        .reduce((sum, m) => sum + m.valor, 0);

      const metasAtivas = metasArray.filter((m) => m.status === 'ATIVA').length;
      const metasVencidas = metasArray.filter((m) => m.status === 'VENCIDA').length;

      const receitasDespesas = [
        { name: 'Entrada', valor: entradasGerais },
        { name: 'Saída', valor: saidasGerais },
      ];

      const categoriasMap = new Map<string, number>();
      movimentacoesArray
        .filter((m) => m.status === 'CONCLUIDA')
        .forEach((m) => {
          const atual = categoriasMap.get(m.categoria) || 0;
          categoriasMap.set(m.categoria, atual + m.valor);
        });

      const TODAS_CATEGORIAS = [
        ...CATEGORIAS_RECEITA,
        ...CATEGORIAS_DESPESA,
        ...CATEGORIAS_TRANSFERENCIA,
        ...CATEGORIAS_INVESTIMENTO,
      ];

      const EPSILON = 0.0001;
      const categoriaDataFormatted = TODAS_CATEGORIAS.map((c) => {
        const realValue = categoriasMap.get(c.value) || 0;
        return {
          name: c.label,
          value: realValue,
          valueForChart: realValue > 0 ? realValue : EPSILON,
        };
      });

      const chartByValue: Record<string, number> = Object.fromEntries(
        TODAS_CATEGORIAS.map((c) => {
          const entry = categoriaDataFormatted.find((d) => d.name === c.label);
          return [c.value, entry ? entry.value : 0];
        })
      );
      const movByValue: Record<string, number> = Object.fromEntries(
        TODAS_CATEGORIAS.map((c) => [c.value, categoriasMap.get(c.value) || 0])
      );
      const diffs: Array<{ categoria: string; esperado: number; exibido: number }> = [];
      TODAS_CATEGORIAS.forEach((c) => {
        const esperado = movByValue[c.value] || 0;
        const exibido = chartByValue[c.value] || 0;
        const delta = Math.abs(esperado - exibido);
        if (delta > 0.0001) {
          diffs.push({ categoria: c.label, esperado, exibido });
        }
      });
      if (diffs.length > 0) {
        console.warn('[Dashboard] Inconsistência categorias (movimentações x pizza):', diffs);
        toast.warn('Algumas categorias do gráfico diferem dos dados. Recarregue a página.');
      } else {
        console.log('[Dashboard] Categorias validadas com sucesso (pizza = movimentações).');
      }

      const recentes = movimentacoesArray
        .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
        .slice(0, 10);

      setData({
        saldoTotal,
        receitasMes: entradasGerais,
        despesasMes: saidasGerais,
        metasAtivas,
        metasVencidas,
      });
      setReceitasDespesasData(receitasDespesas);
      setCategoriaData(categoriaDataFormatted);
      setMovimentacoesRecentes(recentes);
    } catch (error: any) {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Saldo Total</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatCurrency(data.saldoTotal)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Entrada
            </h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(data.receitasMes)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Saída
            </h3>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {formatCurrency(data.despesasMes)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Metas Ativas</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {data.metasAtivas}
            </p>
            {data.metasVencidas > 0 && (
              <p className="text-sm text-red-600 mt-1">
                {data.metasVencidas} vencida(s)
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Entrada vs Saída
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receitasDespesasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Valores totais por Categoria
            </h2>
            {categoriaData.length > 0 ? (
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <ul className="space-y-2">
                    {categoriaData.map((entry, index) => (
                      entry.value > 0 ? (
                        <li key={`legend-${index}`} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-700">{entry.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
                        </li>
                      ) : null
                    ))}
                  </ul>
                </div>
                <div className="w-full lg:w-1/2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="valueForChart"
                      >
                        {categoriaData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, _name: any, props: any) => formatCurrency(props?.payload?.value ?? value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">
                Nenhum dado encontrado
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Movimentações Recentes
          </h2>
          <div className="overflow-x-auto">
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
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesRecentes && movimentacoesRecentes.length > 0 ? (
                  movimentacoesRecentes.map((mov) => (
                    <tr key={mov.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(mov.dataMovimentacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            mov.tipoMovimentacao === TipoMovimentacao.RECEITA
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
                      <td className="px-4 py-3 text-sm font-semibold">
                        {mov.tipoMovimentacao === TipoMovimentacao.RECEITA ? (
                          <span className="text-green-600">
                            +{formatCurrency(mov.valor)}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            -{formatCurrency(mov.valor)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma movimentação recente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

