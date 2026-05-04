'use client';

import { useState, useEffect } from 'react';
import type { PositionWithValues } from '@/lib/carteira-types';

interface UsePositionsReturn {
  positions: PositionWithValues[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePositions(): UsePositionsReturn {
  const [positions, setPositions] = useState<PositionWithValues[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/positions/with-quotes');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPositions(data.positions || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return {
    positions,
    isLoading,
    error,
    refetch: fetchPositions,
  };
}
