import { PositionDetailClient } from './PositionDetailClient';
import { notFound } from 'next/navigation';
import { DatabaseModule } from '@/data/DatabaseModule';
import { PositionModule } from '@/domain/position/PositionModule';
import { QuotesService } from '@/domain/quotes';
import { createDatabase } from '@/lib/database-helpers';

export const dynamic = 'force-dynamic';

function createPositionModule(): PositionModule {
  const db = createDatabase();
  const dbModule = new DatabaseModule(db);
  return new PositionModule(dbModule);
}

function createQuotesService(): QuotesService {
  const db = createDatabase();
  return new QuotesService(db, { cacheTtlMinutes: 15 });
}

interface PositionPageProps {
  params: { id: string };
}

export default async function PositionPage({ params }: PositionPageProps) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const positionModule = createPositionModule();
  const quoteService = createQuotesService();

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
