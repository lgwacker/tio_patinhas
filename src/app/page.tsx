'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  ArrowRight,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardData, AssetClassDistribution, RecentOperation } from '@/domain/dashboard';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-loss">Erro: {error}</div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <a href="/carteira">
          <Button variant="secondary" className="gap-2">
            Ver Carteira
            <ArrowRight size={16} />
          </Button>
        </a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total da Carteira */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet size={18} className="text-primary" />
              Total da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {formatCurrency(summary.totalValue)}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{formatPercentage(summary.totalGainLoss.percentage)}</span>
              <span className="text-text-secondary ml-1">
                ({formatCurrency(summary.totalGainLoss.value)})
              </span>
            </div>
            <div className="text-xs text-text-secondary mt-2">
              {summary.positionCount} posições
            </div>
          </CardContent>
        </Card>

        {/* Valor Investido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity size={18} className="text-primary" />
              Valor Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {formatCurrency(summary.totalInvested)}
            </div>
            <div className="text-sm text-text-secondary mt-2">
              Total aplicado
            </div>
          </CardContent>
        </Card>

        {/* Ganho/Perda Total */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {isPositive ? (
                <TrendingUp size={18} className="text-profit" />
              ) : (
                <TrendingDown size={18} className="text-loss" />
              )}
              Ganho Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(summary.totalGainLoss.value)}
            </div>
            <div className={`text-sm mt-2 ${isPositive ? 'text-profit' : 'text-loss'}`}>
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
            <Activity size={18} className="text-primary" />
            Últimas Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOperations.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Nenhuma operação registrada. Adicione operações na carteira.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOperations.map((operation) => (
                <div
                  key={operation.id}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${operation.tipo === 'compra' ? 'bg-profit' : 'bg-loss'}`} />
                    <div>
                      <div className="font-medium text-text-primary">
                        {operation.tipo === 'compra' ? 'Compra' : 'Venda'} de {operation.ticker}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {operation.quantidade} unidades • {formatDate(operation.data)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text-primary">
                      {formatCurrency(operation.valor_total)}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatCurrency(operation.preco_unitario)}/un
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentOperations.length > 0 && (
            <a href="/historico" className="block mt-4">
              <Button variant="ghost" className="w-full gap-2">
                Ver Histórico Completo
                <ArrowRight size={16} />
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
