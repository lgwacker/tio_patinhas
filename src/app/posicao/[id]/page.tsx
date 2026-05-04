import { PositionDetailClient } from './PositionDetailClient';
import { getDatabaseModule } from '@/lib/database';
import { notFound } from 'next/navigation';

interface PositionPageProps {
  params: { id: string };
}

export default async function PositionPage({ params }: PositionPageProps) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const dbModule = getDatabaseModule();
  const position = dbModule.getPositionById(id);

  if (!position) {
    notFound();
  }

  const operations = dbModule.getOperationsByPositionId(id);

  // Use position's average price as current price (will be replaced with real quotes)
  const precoAtual = position.preco_medio;

  const valorInvestido = position.quantidade * position.preco_medio;
  const valorAtual = position.quantidade * precoAtual;
  const ganhoValor = valorAtual - valorInvestido;
  const ganhoPercentual = valorInvestido > 0 ? (ganhoValor / valorInvestido) * 100 : 0;

  const positionWithCalculations = {
    ...position,
    valorInvestido: Number(valorInvestido.toFixed(2)),
    valorAtual: Number(valorAtual.toFixed(2)),
    ganhoValor: Number(ganhoValor.toFixed(2)),
    ganhoPercentual: Number(ganhoPercentual.toFixed(2)),
    precoAtual,
  };

  return (
    <PositionDetailClient 
      position={positionWithCalculations} 
      operations={operations} 
    />
  );
}
