import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Playbook } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const id = searchParams.get('id');

    let playbooks: Playbook[];

    if (id) {
      // Export single playbook
      playbooks = await query<Playbook>(
        'SELECT id, task_name, steps, common_failures, created_at FROM playbooks WHERE id = $1',
        [parseInt(id)]
      );
    } else {
      // Export all playbooks
      playbooks = await query<Playbook>(
        'SELECT id, task_name, steps, common_failures, created_at FROM playbooks ORDER BY id'
      );
    }

    // Parse JSON fields
    const parsedPlaybooks = playbooks.map(p => ({
      ...p,
      steps: typeof p.steps === 'string' ? JSON.parse(p.steps) : p.steps,
      common_failures: typeof p.common_failures === 'string' 
        ? JSON.parse(p.common_failures) 
        : p.common_failures,
    }));

    if (format === 'csv') {
      // Generate CSV
      const csv = generateCSV(parsedPlaybooks);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="playbooks-${Date.now()}.csv"`,
        },
      });
    } else {
      // Return JSON
      return new NextResponse(JSON.stringify(parsedPlaybooks, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="playbooks-${Date.now()}.json"`,
        },
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}

function generateCSV(playbooks: Playbook[]): string {
  const headers = ['ID', 'Task Name', 'Steps Count', 'Failures Count', 'Created At'];
  const rows = playbooks.map(p => [
    p.id,
    `"${p.task_name.replace(/"/g, '""')}"`,
    p.steps?.length || 0,
    p.common_failures?.length || 0,
    p.created_at || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}
