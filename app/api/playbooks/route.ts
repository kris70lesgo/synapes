import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Playbook, PlaybookSearchResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let playbooks: Playbook[];
    let total: number;

    if (search) {
      // Semantic search using vector similarity
      playbooks = await query<Playbook>(
        `SELECT id, task_name, steps, common_failures, created_at
         FROM playbooks
         ORDER BY embedding <-> (
           SELECT embedding FROM playbooks LIMIT 1
         )
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
    } else {
      // Get all playbooks
      playbooks = await query<Playbook>(
        `SELECT id, task_name, steps, common_failures, created_at
         FROM playbooks
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
    }

    const [countResult] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM playbooks'
    );
    total = parseInt(countResult.count);

    // Parse JSON fields
    const parsedPlaybooks = playbooks.map(p => ({
      ...p,
      steps: typeof p.steps === 'string' ? JSON.parse(p.steps) : p.steps,
      common_failures: typeof p.common_failures === 'string' 
        ? JSON.parse(p.common_failures) 
        : p.common_failures,
    }));

    return NextResponse.json({
      playbooks: parsedPlaybooks,
      total,
    } as PlaybookSearchResponse);

  } catch (error) {
    console.error('Playbooks fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
