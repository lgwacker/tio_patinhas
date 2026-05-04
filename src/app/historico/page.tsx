'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getOperationTypeBadgeClasses } from '@/lib/ui-helpers';
import { Operation, Position } from '@/types';

interface HistoricoData {
  operations: Operation[];
  positions: Position[];
}

export default function HistoricoPage() {
  const [data, setData] = useState<HistoricoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchHistoricoData() {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch('/api/historico');
        if (!response.ok) {
          throw new Error('Failed to fetch historico data');
        }
        const historicoData = await response.json();
        setData(historicoData);
      } catch (err) {
        console.error('[Historico] Failed to fetch data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoricoData();
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
              Não foi possível carregar o histórico
            </h2>
            <p className="text-text-secondary mb-2">
              Ocorreu um problema ao carregar suas operações.
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

  const { operations, positions } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <History size={24} className="text-primary" />
            Histórico
          </h1>
          <p className="text-text-secondary">Todas as operações registradas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operações ({operations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <p className="text-text-secondary text-center py-8">
              Nenhuma operação registrada ainda.
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
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Preço Unitário</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op) => {
                    const position = positions.find(p => p.id === op.position_id);
                    return (
                      <tr key={op.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-text-primary">{formatDate(op.data)}</td>
                        <td className="py-3 px-4 text-text-primary">{position?.ticker || '---'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getOperationTypeBadgeClasses(op.tipo)}`}>
                            {op.tipo === 'compra' ? 'Compra' : 'Venda'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-primary text-right">{op.quantidade}</td>
                        <td className="py-3 px-4 text-text-primary text-right">
                          {formatCurrency(op.preco_unitario)}
                        </td>
                        <td className="py-3 px-4 text-text-primary text-right">
                          {formatCurrency(op.valor_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
