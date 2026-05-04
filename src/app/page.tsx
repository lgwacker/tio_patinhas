import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, TrendingUp, History, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { getDatabaseModule } from '@/lib/database';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getOperationTypeBadgeClasses } from '@/lib/ui-helpers';

const RECENT_OPERATIONS_LIMIT = 5;

export default function DashboardPage() {
  const dbModule = getDatabaseModule();
  const positions = dbModule.getAllPositions();
  const operations = dbModule.getAllOperations().slice(0, RECENT_OPERATIONS_LIMIT);

  const totalInvestido = positions.reduce((acc, pos) => acc + (pos.quantidade * pos.preco_medio), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Visão geral da sua carteira</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Wallet size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Total Investido</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalInvestido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-profit/20 rounded-lg">
                <TrendingUp size={24} className="text-profit" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Posições</p>
                <p className="text-2xl font-bold text-text-primary">{positions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface rounded-lg">
                <History size={24} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Operações</p>
                <p className="text-2xl font-bold text-text-primary">{operations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/nova-posicao">
              <Button>
                <Plus size={20} className="mr-2" />
                Nova Posição
              </Button>
            </Link>
            <Link href="/carteira">
              <Button variant="secondary">
                <Wallet size={20} className="mr-2" />
                Ver Carteira
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      {operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas Operações</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {operations.map((op) => {
                    const position = positions.find(p => p.id === op.position_id);
                    return (
                      <tr key={op.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-text-primary">{formatDate(op.data)}</td>
                        <td className="py-3 px-4 text-text-primary">
                          <Link href={`/posicao/${op.position_id}`} className="text-primary hover:underline">
                            {position?.ticker || '---'}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getOperationTypeBadgeClasses(op.tipo)}`}>
                            {op.tipo === 'compra' ? 'Compra' : 'Venda'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-primary text-right">{op.quantidade}</td>
                        <td className="py-3 px-4 text-text-primary text-right">
                          {formatCurrency(op.valor_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {positions.length === 0 && (
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

