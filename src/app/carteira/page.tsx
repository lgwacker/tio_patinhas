import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDatabaseModule } from '@/lib/database';
import { formatCurrency } from '@/lib/formatters';
import { getProfitLossColorClasses } from '@/lib/ui-helpers';

export default function CarteiraPage() {
  const dbModule = getDatabaseModule();
  const positions = dbModule.getAllPositions();

  const totalInvestido = positions.reduce((acc, pos) => acc + (pos.quantidade * pos.preco_medio), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Carteira</h1>
          <p className="text-text-secondary">
            {positions.length} {positions.length === 1 ? 'posição' : 'posições'} • Valor total: {formatCurrency(totalInvestido)}
          </p>
        </div>
        <Link href="/nova-posicao">
          <Button>
            <Plus size={20} className="mr-2" />
            Nova Posição
          </Button>
        </Link>
      </div>

      {positions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-text-secondary mb-4">
              Sua carteira está vazia. Adicione sua primeira posição para começar.
            </p>
            <Link href="/nova-posicao">
              <Button>
                <Plus size={20} className="mr-2" />
                Adicionar Posição
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {positions.map((position) => {
            const valorInvestido = position.quantidade * position.preco_medio;
            const valorAtual = position.quantidade * position.preco_medio;
            const ganho = valorAtual - valorInvestido;
            const ganhoPercent = valorInvestido > 0 ? (ganho / valorInvestido) * 100 : 0;
            const isProfit = ganho >= 0;
            const profitLossClasses = getProfitLossColorClasses(isProfit);
            const quantidadeLabel = position.quantidade === 1 ? 'unidade' : 'unidades';
            const ganhoSign = isProfit ? '+' : '';

            return (
              <Link key={position.id} href={`/posicao/${position.id}`}>
                <Card className="hover:bg-surface/80 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-text-primary">{position.ticker}</h3>
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                            {position.classe_ativo}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm">{position.nome}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-text-secondary">
                            {position.quantidade} {quantidadeLabel}
                          </span>
                          <span className="text-text-secondary">
                            PM: {formatCurrency(position.preco_medio)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">
                          {formatCurrency(valorInvestido)}
                        </p>
                        <div className={`flex items-center justify-end gap-1 text-sm ${profitLossClasses}`}>
                          {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>{ganhoSign}{ganhoPercent.toFixed(2)}%</span>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-text-secondary ml-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
