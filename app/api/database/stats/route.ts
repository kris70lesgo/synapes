import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Get database fork information and Tiger Postgres stats
export async function GET() {
  try {
    // Get extension status
    const extensions = await query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('pg_trgm', 'vector', 'timescaledb', 'btree_gin')
      ORDER BY extname
    `);

    // Get index information
    const indexes = await query(`
      SELECT 
        indexname,
        indexdef,
        pg_size_pretty(pg_relation_size(indexname::regclass)) as size
      FROM pg_indexes 
      WHERE tablename IN ('playbooks', 'documents')
      ORDER BY indexname
    `);

    // Get table sizes
    const tableSizes = await query(`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename IN ('playbooks', 'documents', 'feedback')
      ORDER BY tablename
    `);

    // Get search capabilities
    const searchStats = await query(`
      SELECT 
        count(*) as total_playbooks,
        count(CASE WHEN search_vector IS NOT NULL THEN 1 END) as fulltext_ready,
        count(CASE WHEN embedding IS NOT NULL THEN 1 END) as semantic_ready,
        avg(confidence_score) as avg_confidence
      FROM playbooks
    `);

    // Get database info
    const dbInfo = await query(`
      SELECT 
        current_database() as database_name,
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections
    `);

    return NextResponse.json({
      database: dbInfo[0],
      extensions: extensions,
      indexes: indexes,
      table_sizes: tableSizes,
      search_stats: searchStats[0],
      tiger_features: {
        fuzzy_search: true,
        fulltext_search: true,
        vector_search: true,
        timescaledb: extensions.some((e: any) => e.extname === 'timescaledb'),
        compression_enabled: false, // Will be true when compression policy is added
        continuous_aggregates: false // Will be true when aggregates are created
      }
    });

  } catch (error) {
    console.error('Database stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
