import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { DashboardService } from './service';

export async function GET() {
  try {
    const db = getDatabase();
    const service = new DashboardService(db);
    const data = service.getDashboardData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
