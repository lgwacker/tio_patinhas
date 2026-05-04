'use client';

import Link from 'next/link';
import type { PositionWithValues } from '@/lib/carteira-types';
import { formatCurrency, formatQuantity } from '@/lib/formatters';
import { GainLossCurrency, GainLossIndicator } from '@/components/ui/GainLossIndicator';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface PositionTableProps {
  positions: PositionWithValues[];
}

export function PositionTable({ positions }: PositionTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Ticker
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Quantidade
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Valor Total
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Investido
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Ganho R$
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Ganho %
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              % Carteira
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr
              key={position.id}
              className="border-b border-border hover:bg-surface/50 cursor-pointer transition-colors"
            >
              <td colSpan={7} className="p-0">
                <Link href={`/posicao/${position.id}`} className="contents" aria-label={`Ver detalhes de ${position.ticker}`}>
                  <div className="flex w-full">
                    <div className="py-3 px-4 flex-1">
                      <div className="font-medium text-text-primary">{position.ticker}</div>
                      {position.nome && (
                        <div className="text-xs text-text-secondary truncate max-w-[150px]">
                          {position.nome}
                        </div>
                      )}
                    </div>
                    <div className="text-right py-3 px-4 text-text-primary w-[100px]">
                      {formatQuantity(position.quantidade)}
                    </div>
                    <div className="text-right py-3 px-4 font-semibold text-text-primary w-[120px]">
                      {formatCurrency(position.valor_atual)}
                    </div>
                    <div className="text-right py-3 px-4 text-text-secondary w-[120px]">
                      {formatCurrency(position.valor_investido)}
                    </div>
                    <div className="text-right py-3 px-4 w-[120px]">
                      <GainLossCurrency value={position.ganho_valor} showIcon={false} />
                    </div>
                    <div className="text-right py-3 px-4 w-[100px]">
                      <GainLossIndicator value={position.ganho_percentual} showIcon={false} />
                    </div>
                    <div className="py-3 px-4 w-[150px]">
                      <ProgressBar percentage={position.percentual_carteira} />
                    </div>
                  </div>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
