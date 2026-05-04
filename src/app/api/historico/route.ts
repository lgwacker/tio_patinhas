import { NextResponse } from 'next/server';
import { createHistoricoDependencies } from '@/lib/composition-helpers';

export async function GET() {
  try {
    const { dbModule } = createHistoricoDependencies();
    const operations = dbModule.getAllOperations();
    const positions = dbModule.getAllPositions();

    return NextResponse.json({ operations, positions });
  } catch (error) {
    console.error('[Historico API] Error fetching historico data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historico data' },
      { status: 500 }
    );
  }
}
