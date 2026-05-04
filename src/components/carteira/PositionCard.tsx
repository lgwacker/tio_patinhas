'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import type { PositionWithValues } from '@/lib/carteira-types';
import { formatCurrency, formatQuantity, formatPercentageAbsolute } from '@/lib/formatters';
import { GainLossCurrency, GainLossIndicator } from '@/components/ui/GainLossIndicator';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface PositionCardProps {
  position: PositionWithValues;
  onClick?: (position: PositionWithValues) => void;
}

export function PositionCard({ position, onClick }: PositionCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onClick?.(position)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-text-primary">{position.ticker}</h3>
            {position.nome && (
              <p className="text-xs text-text-secondary truncate max-w-[200px]">
                {position.nome}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-text-primary">
              {formatCurrency(position.valor_atual)}
            </p>
            <p className="text-xs text-text-secondary">
              {formatQuantity(position.quantidade)} unid.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-text-secondary">Investido</p>
            <p className="text-sm text-text-primary text-right">
              {formatCurrency(position.valor_investido)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Ganho R$</p>
            <p className="text-sm text-right">
              <GainLossCurrency value={position.ganho_valor} showIcon={false} />
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Ganho %</p>
            <p className="text-sm text-right">
              <GainLossIndicator value={position.ganho_percentual} showIcon={false} />
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">% Carteira</p>
            <p className="text-sm text-primary text-right">
              {formatPercentageAbsolute(position.percentual_carteira)}
            </p>
          </div>
        </div>

        <ProgressBar percentage={position.percentual_carteira} />
      </CardContent>
    </Card>
  );
}

interface PositionCardListProps {
  positions: PositionWithValues[];
  onPositionClick?: (position: PositionWithValues) => void;
}

export function PositionCardList({ positions, onPositionClick }: PositionCardListProps) {
  return (
    <div className="md:hidden space-y-3">
      {positions.map((position) => (
        <PositionCard
          key={position.id}
          position={position}
          onClick={onPositionClick}
        />
      ))}
    </div>
  );
}
