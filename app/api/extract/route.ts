import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { extractPlaybook, embedPlaybook } from '@/lib/openai';
import { Document, Playbook, ExtractionResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Get all documents from the database
    const docs = await query<Document>('SELECT id, source, content FROM documents');
    
    if (docs.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No documents found in the database',
        extracted: 0,
        failed: 0,
      } as ExtractionResponse);
    }

    console.log(`Found ${docs.length} documents. Starting extraction...`);

    let extracted = 0;
    let failed = 0;
    const extractedPlaybooks: Array<{ id: number; task_name: string }> = [];

    for (const doc of docs) {
      try {
        console.log(`Processing: ${doc.source}`);

        // Extract playbook using OpenAI
        const playbook = await extractPlaybook(doc.content);

        // Generate embedding
        const embedding = await embedPlaybook(playbook);

        // Insert into database
        const result = await queryOne<{ id: number }>(
          `INSERT INTO playbooks (task_name, steps, common_failures, embedding)
           VALUES ($1, $2, $3, $4::vector)
           RETURNING id`,
          [
            playbook.task_name,
            JSON.stringify(playbook.steps),
            JSON.stringify(playbook.common_failures),
            JSON.stringify(embedding),
          ]
        );

        if (result) {
          extracted++;
          extractedPlaybooks.push({
            id: result.id,
            task_name: playbook.task_name,
          });
          console.log(`✓ Saved: ${playbook.task_name}`);
        }
      } catch (error) {
        failed++;
        console.error(`✗ Failed to process ${doc.source}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Extraction complete! Processed ${docs.length} documents.`,
      extracted,
      failed,
      playbooks: extractedPlaybooks,
    } as ExtractionResponse);

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        extracted: 0,
        failed: 0,
      } as ExtractionResponse,
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const [docCount] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM documents'
    );
    const [playbookCount] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM playbooks'
    );

    return NextResponse.json({
      documents: parseInt(docCount.count),
      playbooks: parseInt(playbookCount.count),
      status: 'ready',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
