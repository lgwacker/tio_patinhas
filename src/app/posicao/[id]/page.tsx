import { PositionDetailClient } from './PositionDetailClient';
import { getPositionModule, getQuoteService } from '@/lib/database';
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
  const quoteService = getQuoteService();

  // Get position data first to obtain the ticker
  const position = positionModule.getPositionById(id);
  if (!position) {
    notFound();
  }

  // Fetch current price from quotes service (uses cache or fetches from APIs)
  const precoAtual = await quoteService.fetchPrice(position.ticker) ?? 0;

  // Get position with calculations using the current price
  const result = positionModule.getPositionWithCalculations(id, precoAtual);

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
