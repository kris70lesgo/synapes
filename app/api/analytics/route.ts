import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Total counts
    const [counts] = await query<{ documents: string; playbooks: string; feedback: string }>(
      `SELECT 
        (SELECT COUNT(*) FROM documents) as documents,
        (SELECT COUNT(*) FROM playbooks) as playbooks,
        (SELECT COUNT(*) FROM feedback) as feedback`
    );

    // Average steps per playbook
    const [avgSteps] = await query<{ avg_steps: string }>(
      `SELECT AVG(jsonb_array_length(steps::jsonb)) as avg_steps FROM playbooks`
    );

    // Playbooks by creation date (last 7 days)
    const timeline = await query<{ date: string; count: string }>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM playbooks
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Most common failure types
    const commonFailures = await query<{ issue: string; count: number }>(
      `SELECT 
        jsonb_array_elements(common_failures::jsonb)->>'issue' as issue,
        COUNT(*) as count
       FROM playbooks
       WHERE common_failures IS NOT NULL
       GROUP BY issue
       ORDER BY count DESC
       LIMIT 10`
    );

    // Feedback stats
    const [feedbackStats] = await query<{ helpful: string; not_helpful: string; total: string }>(
      `SELECT 
        COUNT(*) FILTER (WHERE was_helpful = true) as helpful,
        COUNT(*) FILTER (WHERE was_helpful = false) as not_helpful,
        COUNT(*) as total
       FROM feedback`
    );

    // Playbooks with most steps
    const topPlaybooks = await query<{ id: number; task_name: string; step_count: number }>(
      `SELECT 
        id,
        task_name,
        jsonb_array_length(steps::jsonb) as step_count
       FROM playbooks
       ORDER BY step_count DESC
       LIMIT 5`
    );

    return NextResponse.json({
      overview: {
        documents: parseInt(counts.documents || '0'),
        playbooks: parseInt(counts.playbooks || '0'),
        feedback: parseInt(counts.feedback || '0'),
        avgSteps: parseFloat(avgSteps?.avg_steps || '0').toFixed(1),
      },
      timeline,
      commonFailures,
      feedbackStats: {
        helpful: parseInt(feedbackStats?.helpful || '0'),
        notHelpful: parseInt(feedbackStats?.not_helpful || '0'),
        total: parseInt(feedbackStats?.total || '0'),
        helpfulRate: feedbackStats?.total 
          ? Math.round((parseInt(feedbackStats.helpful) / parseInt(feedbackStats.total)) * 100)
          : 0,
      },
      topPlaybooks,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
