import { NextResponse } from 'next/server';
import { DatabaseModule } from '@/data/DatabaseModule';
import { createDatabase } from '@/lib/database-helpers';

export async function GET() {
  try {
    const db = createDatabase();
    const dbModule = new DatabaseModule(db);
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
