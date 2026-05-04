import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { MigrationRunner } from '@/data/MigrationRunner';
import { DashboardService } from './service';

const DB_PATH = process.env.DB_PATH || './data/tio_patinhas.db';

export async function GET() {
  try {
    const db = new Database(DB_PATH);
    
    // Ensure migrations are run
    const migrations = new MigrationRunner(db);
    migrations.runMigrations();
    
    // Get dashboard data
    const service = new DashboardService(db);
    const data = service.getDashboardData();
    
    db.close();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
