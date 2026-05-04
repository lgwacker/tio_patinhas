import { NextResponse } from 'next/server';
import { DashboardService } from './service';
import { createDashboardDependencies } from '@/lib/composition-helpers';

export async function GET() {
  try {
    const { dataModule, quotesService } = createDashboardDependencies();
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
