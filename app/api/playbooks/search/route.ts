import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateEmbedding } from '@/lib/openai';
import { Playbook } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    console.log(`Generating embedding for query: "${q}"`);
    const queryEmbedding = await generateEmbedding(q);

    // Search using vector similarity (cosine distance)
    const results = await query<Playbook & { similarity: number }>(
      `SELECT 
        id, 
        task_name, 
        steps, 
        common_failures, 
        created_at,
        1 - (embedding <=> $1::vector) as similarity
       FROM playbooks
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(queryEmbedding), limit]
    );

    // Parse JSON fields
    const parsedResults = results.map(r => ({
      ...r,
      steps: typeof r.steps === 'string' ? JSON.parse(r.steps) : r.steps,
      common_failures: typeof r.common_failures === 'string' 
        ? JSON.parse(r.common_failures) 
        : r.common_failures,
      similarity: Math.round(r.similarity * 100), // Convert to percentage
    }));

    return NextResponse.json({
      query: q,
      results: parsedResults,
      count: parsedResults.length,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
