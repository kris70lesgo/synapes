'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📤 Upload Documents</h1>
            <p className="text-gray-400">Upload markdown or text files to create new documents</p>
          </div>
          <div className="flex gap-3">
            <Link href="/playbooks" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition">
              📚 Playbooks
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">
              🔧 Admin
            </Link>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`bg-white/10 backdrop-blur-md rounded-xl p-12 border-2 border-dashed transition ${
            dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              {dragActive ? 'Drop files here' : 'Upload Documents'}
            </h2>
            <p className="text-gray-400 mb-6">
              Drag & drop .md or .txt files, or click to browse
            </p>

            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".md,.txt"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
              <span className="inline-block px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {uploading ? 'Uploading...' : '📂 Browse Files'}
              </span>
            </label>

            <p className="text-sm text-gray-500 mt-4">
              Accepted formats: .md, .txt
            </p>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`mt-6 p-6 rounded-xl ${result.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
            <div className="font-semibold text-white mb-2">
              {result.success ? '✓ Upload Successful' : '✗ Upload Failed'}
            </div>
            <div className="text-gray-200 text-sm mb-3">{result.message || result.error}</div>

            {result.files && result.files.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-white mb-2">Uploaded Files:</div>
                <div className="space-y-2">
                  {result.files.map((file: any, idx: number) => (
                    <div key={idx} className="bg-black/30 rounded px-3 py-2 text-sm text-gray-300 flex items-center justify-between">
                      <span>{file.name}</span>
                      <span className="text-xs text-gray-500">{file.length} chars</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    href="/admin"
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
                  >
                    🚀 Extract Playbooks
                  </Link>
                  <button
                    onClick={() => setResult(null)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                  >
                    Upload More
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">📝 Instructions</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Upload markdown (.md) or text (.txt) files containing operational documentation</li>
            <li>• Multiple files can be uploaded at once</li>
            <li>• After upload, go to Admin panel to extract playbooks</li>
            <li>• Playbooks will be created using Claude Sonnet 3.5</li>
            <li>• Each document should contain clear steps, commands, and procedures</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
