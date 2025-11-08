import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    let uploaded = 0;
    const uploadedFiles = [];

    for (const file of files) {
      // Check file type
      if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
        console.log(`Skipping ${file.name} - not a markdown or text file`);
        continue;
      }

      // Read file content
      const content = await file.text();

      if (!content || content.trim().length === 0) {
        console.log(`Skipping ${file.name} - empty file`);
        continue;
      }

      // Insert into database
      await query(
        'INSERT INTO documents (source, content) VALUES ($1, $2)',
        [file.name, content]
      );

      uploaded++;
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        length: content.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${uploaded} file(s)`,
      uploaded,
      files: uploadedFiles,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
