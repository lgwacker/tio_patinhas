'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  ArrowRight,
  Activity,
  Plus,
  History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DashboardData, AssetClassDistribution, RecentOperation } from '@/types';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/formatters';


function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('[Dashboard] Failed to fetch data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [retryCount]);

  function handleRetry() {
    setRetryCount(prev => prev + 1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-loss/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown size={32} className="text-loss" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Não foi possível carregar dados
            </h2>
            <p className="text-text-secondary mb-2">
              Ocorreu um problema ao carregar suas informações.
            </p>
            <p className="text-text-secondary">
              Por favor, tente novamente.
            </p>
          </div>
          <Button onClick={handleRetry} size="lg">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Nenhum dado disponível</div>
      </div>
    );
  }

  const { summary, assetClassDistribution, recentOperations } = data;
  const isPositive = summary.totalGainLoss.value >= 0;
  
  const gainLossColorClass = isPositive ? 'text-profit' : 'text-loss';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Visão geral da sua carteira</p>
        </div>
        <div className="flex gap-2">
          <Link href="/nova-posicao">
            <Button>
              <Plus size={20} className="mr-2" />
              Nova Posição
            </Button>
          </Link>
          <Link href="/carteira">
            <Button variant="secondary" className="gap-2">
              Ver Carteira
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total da Carteira */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Wallet size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Total da Carteira</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(summary.totalValue)}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-sm ${gainLossColorClass}`}>
              <TrendIcon size={16} />
              <span>{formatPercentage(summary.totalGainLoss.percentage)}</span>
              <span className="text-text-secondary ml-1">
                ({formatCurrency(summary.totalGainLoss.value)})
              </span>
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {summary.positionCount} {summary.positionCount === 1 ? 'posição' : 'posições'}
            </div>
          </CardContent>
        </Card>

        {/* Valor Investido */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface rounded-lg">
                <Activity size={24} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Valor Investido</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(summary.totalInvested)}
                </p>
              </div>
            </div>
            <div className="text-xs text-text-secondary mt-4">
              Total aplicado
            </div>
          </CardContent>
        </Card>

        {/* Ganho/Perda Total */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isPositive ? 'bg-profit/20' : 'bg-loss/20'}`}>
                <TrendIcon size={24} className={gainLossColorClass} />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Ganho Total</p>
                <p className={`text-2xl font-bold ${gainLossColorClass}`}>
                  {formatCurrency(summary.totalGainLoss.value)}
                </p>
              </div>
            </div>
            <div className={`text-sm mt-3 ${gainLossColorClass}`}>
              {formatPercentage(summary.totalGainLoss.percentage)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Class Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart size={18} className="text-primary" />
            Distribuição por Classe de Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assetClassDistribution.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Nenhuma posição cadastrada. Adicione operações na carteira para ver a distribuição.
            </p>
          ) : (
            <div className="space-y-3">
              {assetClassDistribution.map((item) => (
                <div key={item.classe_ativo} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-primary">{item.label}</span>
                    <span className="text-text-secondary">
                      {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-text-secondary">
                    {item.count} {item.count === 1 ? 'posição' : 'posições'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History size={18} className="text-primary" />
            Últimas Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOperations.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Nenhuma operação registrada. Adicione operações na carteira.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Ticker</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Quantidade</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOperations.map((op) => (
                    <tr key={op.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-text-primary">{formatDate(op.data)}</td>
                      <td className="py-3 px-4 text-text-primary">
                        <Link href={`/posicao/${op.position_id}`} className="text-primary hover:underline">
                          {op.ticker}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${op.tipo === 'compra' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          {op.tipo === 'compra' ? 'Compra' : 'Venda'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-primary text-right">{op.quantidade}</td>
                      <td className="py-3 px-4 text-text-primary text-right">
                        {formatCurrency(op.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {recentOperations.length > 0 && (
            <Link href="/historico" className="block mt-4">
              <Button variant="ghost" className="w-full gap-2">
                Ver Histórico Completo
                <ArrowRight size={16} />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {summary.positionCount === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-text-secondary mb-4">
              Bem-vindo ao Tio Patinhas! Comece adicionando sua primeira posição.
            </p>
            <Link href="/nova-posicao">
              <Button size="lg">
                <Plus size={20} className="mr-2" />
                Adicionar Primeira Posição
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
