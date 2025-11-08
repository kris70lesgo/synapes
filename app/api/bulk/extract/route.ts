import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Bulk extraction from multiple documents
export async function POST(request: NextRequest) {
  try {
    const { document_ids } = await request.json();

    if (!Array.isArray(document_ids) || document_ids.length === 0) {
      return NextResponse.json(
        { error: 'document_ids array required' },
        { status: 400 }
      );
    }

    // Get documents
    const documents = await query(
      'SELECT id, content FROM documents WHERE id = ANY($1::int[])',
      [document_ids]
    );

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      );
    }

    const { extractPlaybook, embedPlaybook } = await import('@/lib/openai');
    
    const results = [];
    const errors = [];

    // Process each document
    for (const doc of documents) {
      try {
        console.log(`Extracting from document ${doc.id}...`);
        
        const playbook = await extractPlaybook(doc.content);
        
        // Generate embedding
        const embeddingText = embedPlaybook(playbook);
        const { generateEmbedding } = await import('@/lib/openai');
        const embedding = await generateEmbedding(embeddingText);

        // Insert playbook
        const result = await query(
          `INSERT INTO playbooks 
           (task_name, steps, common_failures, embedding, confidence_score, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW()) 
           RETURNING id, task_name, confidence_score`,
          [
            playbook.task_name,
            JSON.stringify(playbook.steps),
            JSON.stringify(playbook.common_failures || []),
            JSON.stringify(embedding),
            0.8
          ]
        );

        results.push({
          document_id: doc.id,
          playbook_id: result[0].id,
          task_name: result[0].task_name,
          confidence_score: result[0].confidence_score,
          success: true
        });

        console.log(`✓ Extracted playbook ${result[0].id} from document ${doc.id}`);

      } catch (error) {
        console.error(`✗ Failed to extract from document ${doc.id}:`, error);
        errors.push({
          document_id: doc.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: documents.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk extraction error:', error);
    return NextResponse.json(
      { error: 'Bulk extraction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
