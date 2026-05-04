'use client';

import React, { useMemo } from 'react';
import type { PositionWithValues } from '@/lib/carteira-types';
import { PositionTable } from './PositionTable';
import { PositionCardList } from './PositionCard';

interface PositionListProps {
  positions: PositionWithValues[];
  onPositionClick?: (position: PositionWithValues) => void;
}

/**
 * Combined position list with responsive design
 * Desktop: Table view
 * Mobile: Card view
 * Default sort: Valor Total descrescente
 */
export function PositionList({ positions, onPositionClick }: PositionListProps) {
  // Sort positions by Valor Total descrescente (default)
  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => b.valor_atual - a.valor_atual);
  }, [positions]);

  if (positions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">
          Nenhuma posição encontrada nesta classe de ativo.
        </p>
      </div>
    );
  }

  return (
    <>
      <PositionTable positions={sortedPositions} onPositionClick={onPositionClick} />
      <PositionCardList positions={sortedPositions} onPositionClick={onPositionClick} />
    </>
  );
}