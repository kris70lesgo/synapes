import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Playbook } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [playbook] = await query<Playbook>(
      `SELECT id, task_name, steps, common_failures, created_at
       FROM playbooks
       WHERE id = $1`,
      [parseInt(id)]
    );

    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedPlaybook = {
      ...playbook,
      steps: typeof playbook.steps === 'string' ? JSON.parse(playbook.steps) : playbook.steps,
      common_failures: typeof playbook.common_failures === 'string' 
        ? JSON.parse(playbook.common_failures) 
        : playbook.common_failures,
    };

    return NextResponse.json(parsedPlaybook);

  } catch (error) {
    console.error('Playbook fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
