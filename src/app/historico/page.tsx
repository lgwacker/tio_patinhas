import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getDatabaseModule } from '@/lib/database';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getOperationTypeBadgeClasses } from '@/lib/ui-helpers';

export default function HistoricoPage() {
  const dbModule = getDatabaseModule();
  const operations = dbModule.getAllOperations();
  const positions = dbModule.getAllPositions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Histórico</h1>
        <p className="text-text-secondary">Todas as operações registradas</p>
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
