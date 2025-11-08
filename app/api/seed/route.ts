import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const sampleDocsPath = join(process.cwd(), 'sample-docs');
    
    // Read all markdown files
    const files = await readdir(sampleDocsPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    let inserted = 0;
    const documents = [];

    for (const file of mdFiles) {
      const filePath = join(sampleDocsPath, file);
      const content = await readFile(filePath, 'utf-8');
      
      // Insert into database
      await query(
        'INSERT INTO documents (source, content) VALUES ($1, $2)',
        [file, content]
      );
      
      inserted++;
      documents.push({ source: file, length: content.length });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${inserted} documents`,
      documents,
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
