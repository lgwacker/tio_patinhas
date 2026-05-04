'use client';

import React from 'react';
import type { PositionWithValues } from '@/lib/carteira-types';
import { formatCurrency, formatQuantity } from '@/lib/formatters';
import { GainLossCurrency, GainLossIndicator } from '@/components/ui/GainLossIndicator';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface PositionTableProps {
  positions: PositionWithValues[];
  onPositionClick?: (position: PositionWithValues) => void;
}

export function PositionTable({ positions, onPositionClick }: PositionTableProps) {
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
              onClick={() => onPositionClick?.(position)}
              className="border-b border-border hover:bg-surface/50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4">
                <div className="font-medium text-text-primary">{position.ticker}</div>
                {position.nome && (
                  <div className="text-xs text-text-secondary truncate max-w-[150px]">
                    {position.nome}
                  </div>
                )}
              </td>
              <td className="text-right py-3 px-4 text-text-primary">
                {formatQuantity(position.quantidade)}
              </td>
              <td className="text-right py-3 px-4 font-semibold text-text-primary">
                {formatCurrency(position.valor_atual)}
              </td>
              <td className="text-right py-3 px-4 text-text-secondary">
                {formatCurrency(position.valor_investido)}
              </td>
              <td className="text-right py-3 px-4">
                <GainLossCurrency value={position.ganho_valor} showIcon={false} />
              </td>
              <td className="text-right py-3 px-4">
                <GainLossIndicator value={position.ganho_percentual} showIcon={false} />
              </td>
              <td className="py-3 px-4">
                <ProgressBar percentage={position.percentual_carteira} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
