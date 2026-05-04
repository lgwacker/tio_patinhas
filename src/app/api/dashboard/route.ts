import { NextResponse } from 'next/server';
import { DashboardService } from './service';
import { createDashboardDependencies } from '@/lib/composition-helpers';

// Dynamic rendering ensures fresh data on each request (Issue #54)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { dataModule, quotesService } = createDashboardDependencies();

    // Fetch fresh quotes for all positions to ensure consistent values (Issue #48)
    const positions = dataModule.getAllPositions();
    await Promise.all(
      positions.map(async (position) => {
        await quotesService.fetchPrice(position.ticker);
      })
    );

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
