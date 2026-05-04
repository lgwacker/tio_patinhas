import { PositionDetailClient } from './PositionDetailClient';
import { getPositionModule } from '@/lib/database';
import { notFound } from 'next/navigation';

interface PositionPageProps {
  params: { id: string };
}

export default async function PositionPage({ params }: PositionPageProps) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const positionModule = getPositionModule();

  // Using 0 as precoAtual since we're not fetching real quotes yet
  const result = positionModule.getPositionWithCalculations(id, 0);

  if (!result) {
    notFound();
  }

  return (
    <PositionDetailClient
      position={result}
      operations={result.operations}
    />
  );
}
