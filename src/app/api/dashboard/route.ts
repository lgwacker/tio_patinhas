import { NextResponse } from 'next/server';
import { DashboardService } from './service';
import { createDashboardDependencies } from '@/lib/composition-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { dataModule, quotesService } = createDashboardDependencies();

    const positions = dataModule.getAllPositions();
    await Promise.all(
      positions.map((position) => quotesService.fetchPrice(position.ticker))
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
