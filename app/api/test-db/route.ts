import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    // Create a fresh connection for testing
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const result = await pool.query('SELECT NOW() as time, version() as version');
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      time: result.rows[0].time,
      version: result.rows[0].version,
    });
  } catch (error) {
    console.error('DB Test Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
