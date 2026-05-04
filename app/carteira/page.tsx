'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AssetClassTabs } from '@/components/carteira/AssetClassTabs';
import { PositionList } from '@/components/carteira/PositionList';
import type { PositionWithValues } from '@/lib/carteira-types';
import type { AssetClass } from '@/types';

// Mock data for demonstration - will be replaced with real data from API
const mockPositions: PositionWithValues[] = [
  {
    id: 1,
    ticker: 'PETR4',
    nome: 'Petrobras PN',
    classe_ativo: 'acao',
    setor: 'Energia',
    segmento: 'Petróleo',
    quantidade: 100,
    preco_medio: 25.5,
    preco_atual: 32.8,
    data_criacao: '2024-01-15',
    updated_at: '2024-01-15',
    valor_investido: 2550,
    valor_atual: 3280,
    ganho_valor: 730,
    ganho_percentual: 28.63,
    percentual_carteira: 45.2,
  },
  {
    id: 2,
    ticker: 'VALE3',
    nome: 'Vale SA',
    classe_ativo: 'acao',
    setor: 'Materiais',
    segmento: 'Mineração',
    quantidade: 50,
    preco_medio: 65.0,
    preco_atual: 58.2,
    data_criacao: '2024-02-10',
    updated_at: '2024-02-10',
    valor_investido: 3250,
    valor_atual: 2910,
    ganho_valor: -340,
    ganho_percentual: -10.46,
    percentual_carteira: 40.1,
  },
  {
    id: 3,
    ticker: 'HGLG11',
    nome: 'CSHG Logística',
    classe_ativo: 'fii',
    setor: 'Logística',
    segmento: null,
    quantidade: 10,
    preco_medio: 150.0,
    preco_atual: 156.8,
    data_criacao: '2024-03-05',
    updated_at: '2024-03-05',
    valor_investido: 1500,
    valor_atual: 1568,
    ganho_valor: 68,
    ganho_percentual: 4.53,
    percentual_carteira: 21.6,
  },
];

/**
 * Carteira page - List view of positions organized by asset class
 */
export default function CarteiraPage() {
  const router = useRouter();
  const [activeAssetClass, setActiveAssetClass] = useState<AssetClass>('acao');

  // Filter positions by asset class
  const filteredPositions = useMemo(() => {
    return mockPositions.filter((p) => p.classe_ativo === activeAssetClass);
  }, [activeAssetClass]);

  // Handle position click - navigate to detail page
  const handlePositionClick = useCallback((position: PositionWithValues) => {
    router.push(`/posicao/${position.id}`);
  }, [router]);

  // Handle add operation
  const handleAddOperation = useCallback(() => {
    router.push('/operacao/nova');
  }, [router]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Carteira</h1>
            <p className="text-text-secondary mt-1">
              Acompanhe suas posições por classe de ativo
            </p>
          </div>
          <Button
            onClick={handleAddOperation}
            className="hidden sm:flex items-center gap-2"
          >
            <Plus size={18} />
            Nova Operação
          </Button>
        </div>

        {/* Asset Class Tabs */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <AssetClassTabs
              activeTab={activeAssetClass}
              onTabChange={setActiveAssetClass}
            />
          </CardContent>
        </Card>

        {/* Position List */}
        <Card>
          <CardContent className="p-0">
            <PositionList
              positions={filteredPositions}
              onPositionClick={handlePositionClick}
            />
          </CardContent>
        </Card>

        {/* Mobile FAB */}
        <button
          onClick={handleAddOperation}
          className="sm:hidden fixed bottom-4 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          aria-label="Nova operação"
        >
          <Plus size={24} />
        </button>
      </div>
    </Layout>
  );
}