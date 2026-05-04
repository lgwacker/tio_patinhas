'use client';

import { useMemo } from 'react';
import type { PositionWithValues } from '@/lib/carteira-types';
import { PositionTable } from './PositionTable';
import { PositionCardList } from './PositionCard';

interface PositionListProps {
  positions: PositionWithValues[];
}

function sortByValueDesc(positions: PositionWithValues[]) {
  return [...positions].sort((a, b) => b.valor_atual - a.valor_atual);
}

export function PositionList({ positions }: PositionListProps) {
  const sortedPositions = useMemo(
    () => sortByValueDesc(positions),
    [positions]
  );

  return (
    <>
      <PositionTable positions={sortedPositions} />
      <PositionCardList positions={sortedPositions} />
    </>
  );
}
