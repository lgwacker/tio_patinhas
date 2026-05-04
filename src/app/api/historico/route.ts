import { NextResponse } from 'next/server';
import { getDatabaseModule } from '@/lib/database';

export async function GET() {
  try {
    const dbModule = getDatabaseModule();
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
