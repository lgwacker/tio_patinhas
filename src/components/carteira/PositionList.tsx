'use client';

import React, { useMemo } from 'react';
import type { PositionListProps, PositionWithValues } from '@/lib/carteira-types';
import { PositionTable } from './PositionTable';
import { PositionCardList } from './PositionCard';

function sortByValueDesc(positions: PositionWithValues[]) {
  return [...positions].sort((a, b) => b.valor_atual - a.valor_atual);
}

export function PositionList({ positions, onPositionClick }: PositionListProps) {
  const sortedPositions = useMemo(
    () => sortByValueDesc(positions),
    [positions]
  );

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
