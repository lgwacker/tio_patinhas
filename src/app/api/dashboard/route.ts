import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { DatabaseModule } from '@/data/DatabaseModule';
import { QuotesService } from '@/domain/quotes';
import { DashboardService } from './service';

export async function GET() {
  try {
    const db = getDatabase();
    
    // Explicitly wire dependencies at the composition root (API route)
    const dataModule = new DatabaseModule(db);
    const quotesService = new QuotesService(db, { cacheTtlMinutes: 15 });
    const dashboardService = new DashboardService(dataModule, quotesService);
    
    const data = dashboardService.getDashboardData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
