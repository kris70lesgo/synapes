import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { FeedbackResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playbook_id, user_query, was_helpful, comment } = body;

    if (!playbook_id || typeof was_helpful !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'playbook_id and was_helpful are required' 
        } as FeedbackResponse,
        { status: 400 }
      );
    }

    const result = await queryOne<{ id: number }>(
      `INSERT INTO feedback (playbook_id, user_query, was_helpful, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [playbook_id, user_query || '', was_helpful, comment || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback_id: result?.id,
    } as FeedbackResponse);

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      } as FeedbackResponse,
      { status: 500 }
    );
  }
}
