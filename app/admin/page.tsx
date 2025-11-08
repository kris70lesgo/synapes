'use client';

import { useState } from 'react';
import { ExtractionResponse } from '@/lib/types';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResponse | null>(null);
  const [status, setStatus] = useState<any>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/extract');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const runExtraction = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
      });
      const data = await res.json();
      setResult(data);
      
      // Refresh status after extraction
      if (data.success) {
        await checkStatus();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Extraction failed',
        extracted: 0,
        failed: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔧 Admin Panel
          </h1>
          <p className="text-gray-400">
            Extract playbooks from documents using AI
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Database Status</h2>
            <button
              onClick={checkStatus}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>
          
          {status && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Documents</div>
                <div className="text-3xl font-bold text-white">{status.documents}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Playbooks</div>
                <div className="text-3xl font-bold text-white">{status.playbooks}</div>
              </div>
            </div>
          )}
        </div>

        {/* Extraction Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            Run Extraction
          </h2>
          
          <p className="text-gray-300 mb-4">
            This will process all documents in the database and extract structured playbooks using <span className="text-blue-400 font-semibold">Claude Sonnet 3.5</span> via OpenRouter.
          </p>

          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              <span className="font-semibold">💡 AI Model:</span> anthropic/claude-3.5-sonnet
            </p>
            <p className="text-blue-300 text-sm mt-1">
              <span className="font-semibold">🔍 Embeddings:</span> openai/text-embedding-3-small
            </p>
            <p className="text-blue-300 text-sm mt-1">
              <span className="font-semibold">⏱️ Processing:</span> ~10-15 seconds per document
            </p>
          </div>

          <button
            onClick={runExtraction}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Extracting with Claude...
              </span>
            ) : (
              '🚀 Start Extraction'
            )}
          </button>

          {/* Results */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
              <div className="font-semibold text-white mb-2">
                {result.success ? '✓ Success' : '✗ Failed'}
              </div>
              <div className="text-gray-200 text-sm mb-3">{result.message}</div>
              
              {result.success && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{result.extracted}</div>
                    <div className="text-xs text-gray-400">Extracted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{result.failed}</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                </div>
              )}

              {result.playbooks && result.playbooks.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-white mb-2">Extracted Playbooks:</div>
                  <div className="space-y-2">
                    {result.playbooks.map((pb) => (
                      <div key={pb.id} className="bg-black/30 rounded px-3 py-2 text-sm text-gray-300">
                        #{pb.id} - {pb.task_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <a
            href="/upload"
            className="text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            📤 Upload Documents
          </a>
          <a
            href="/database"
            className="text-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            🐘 Database Management
          </a>
          <a
            href="/playbooks"
            className="text-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition border border-white/20"
          >
            📚 View Playbooks
          </a>
          <a
            href="/"
            className="text-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition border border-white/20"
          >
            🏠 Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
