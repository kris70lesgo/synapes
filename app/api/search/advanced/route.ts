import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Advanced search combining fuzzy, full-text, and semantic search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const mode = searchParams.get('mode') || 'hybrid'; // fuzzy, fulltext, semantic, hybrid
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    let results = [];

    if (mode === 'fuzzy' || mode === 'hybrid') {
      // Fuzzy search using pg_trgm
      const fuzzyResults = await query(
        'SELECT * FROM search_playbooks_fuzzy($1, $2)',
        [q, limit]
      );
      
      results = fuzzyResults.map((row: any) => ({
        ...row,
        search_type: 'fuzzy',
        score: row.similarity
      }));
    }

    if (mode === 'fulltext' || mode === 'hybrid') {
      // Full-text search using pg_text
      const fulltextResults = await query(
        'SELECT * FROM search_playbooks_fulltext($1, $2)',
        [q, limit]
      );
      
      const ftResults = fulltextResults.map((row: any) => ({
        ...row,
        search_type: 'fulltext',
        score: row.rank
      }));

      results = mode === 'hybrid' 
        ? [...results, ...ftResults]
        : ftResults;
    }

    if (mode === 'semantic') {
      // Import openai for embedding generation
      const { generateEmbedding } = await import('@/lib/openai');
      const embedding = await generateEmbedding(q);
      
      // Vector similarity search
      const semanticResults = await query(
        `SELECT 
          id, 
          task_name, 
          confidence_score,
          1 - (embedding <=> $1::vector) as similarity
        FROM playbooks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $2`,
        [JSON.stringify(embedding), limit]
      );

      results = semanticResults.map((row: any) => ({
        ...row,
        search_type: 'semantic',
        score: row.similarity
      }));
    }

    // Hybrid mode: combine and rank results
    if (mode === 'hybrid') {
      // Remove duplicates and combine scores
      const uniqueResults = new Map();
      
      results.forEach((result: any) => {
        if (uniqueResults.has(result.id)) {
          const existing = uniqueResults.get(result.id);
          existing.score = (existing.score + result.score) / 2;
          existing.search_types = [...new Set([...existing.search_types, result.search_type])];
        } else {
          uniqueResults.set(result.id, {
            ...result,
            search_types: [result.search_type]
          });
        }
      });

      results = Array.from(uniqueResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Fetch full playbook details
    if (results.length > 0) {
      const ids = results.map((r: any) => r.id);
      const fullPlaybooks = await query(
        `SELECT 
          id, 
          task_name, 
          steps, 
          common_failures, 
          confidence_score,
          created_at,
          view_count
        FROM playbooks 
        WHERE id = ANY($1::int[])`,
        [ids]
      );

      // Merge with scores
      results = results.map((result: any) => {
        const fullPlaybook = fullPlaybooks.find((p: any) => p.id === result.id);
        return {
          ...fullPlaybook,
          search_score: Math.round(result.score * 100),
          search_types: result.search_types || [result.search_type]
        };
      });
    }

    return NextResponse.json({
      results,
      count: results.length,
      query: q,
      mode
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
