'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { AssetClassTabs } from '@/components/carteira/AssetClassTabs';
import { PositionList } from '@/components/carteira/PositionList';
import { usePositions } from '@/hooks/usePositions';
import { formatCurrency } from '@/lib/formatters';
import type { AssetClass } from '@/types';
import { ASSET_CLASS_TABS } from '@/lib/carteira-types';

export const dynamic = 'force-dynamic';

export default function CarteiraPage() {
  const [activeTab, setActiveTab] = useState<AssetClass>('acao');
  const { positions, isLoading } = usePositions();

  const assetClassCounts = useMemo(() => {
    const counts = ASSET_CLASS_TABS.reduce<Record<AssetClass, number>>(
      (acc, tab) => ({ ...acc, [tab.value]: 0 }),
      {} as Record<AssetClass, number>
    );
    positions.forEach((pos) => {
      counts[pos.classe_ativo]++;
    });
    return counts;
  }, [positions]);

  // Filter positions by active tab (positions already have calculated values from API)
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => pos.classe_ativo === activeTab);
  }, [positions, activeTab]);

  // Calculate totals using market-based values
  const totalValorAtual = positions.reduce(
    (acc, pos) => acc + pos.valor_atual,
    0
  );
  
  const totalValorInvestido = positions.reduce(
    (acc, pos) => acc + pos.valor_investido,
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Carteira</h1>
            <p className="text-text-secondary">Carregando...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Carteira</h1>
          <p className="text-text-secondary">
            {positions.length} {positions.length === 1 ? 'posição' : 'posições'} • Valor total: {formatCurrency(totalValorAtual)}
          </p>
          {positions.length > 0 && (
            <p className="text-sm text-text-secondary mt-1">
              Investido: {formatCurrency(totalValorInvestido)}
            </p>
          )}
        </div>
        <Link href="/nova-posicao">
          <Button>
            <Plus size={20} className="mr-2" />
            Nova Posição
          </Button>
        </Link>
      </div>

      <AssetClassTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        counts={assetClassCounts}
      />

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
      ) : filteredPositions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-text-secondary">
            Nenhuma posição encontrada nesta classe de ativo.
          </p>
        </div>
      ) : (
        <PositionList positions={filteredPositions} />
      )}
    </div>
  );
}
