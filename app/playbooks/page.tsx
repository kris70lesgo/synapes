'use client';

import { useState, useEffect } from 'react';
import { Playbook } from '@/lib/types';
import Link from 'next/link';

type SearchResult = Playbook & { similarity?: number };

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      const res = await fetch('/api/playbooks');
      const data = await res.json();
      setPlaybooks(data.playbooks || []);
    } catch (error) {
      console.error('Failed to fetch playbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!search.trim()) {
      fetchPlaybooks();
      setUseSemanticSearch(false);
      return;
    }

    setSearching(true);
    setUseSemanticSearch(true);
    try {
      const res = await fetch(`/api/playbooks/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setPlaybooks(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      setUseSemanticSearch(false);
      fetchPlaybooks();
    }
  };

  const filteredPlaybooks = useSemanticSearch 
    ? playbooks 
    : playbooks.filter(pb =>
        pb.task_name.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">📚 Playbooks</h1>
            <div className="flex gap-3">
              <a
                href="/api/export?format=json"
                download
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                📥 JSON
              </a>
              <a
                href="/api/export?format=csv"
                download
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                📥 CSV
              </a>
              <Link
                href="/analytics"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                📊 Analytics
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
              >
                Admin Panel
              </Link>
            </div>
          </div>
          <p className="text-gray-400">
            AI-extracted operational playbooks from your documentation
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search playbooks... (e.g., 'deploy docker', 'fix memory leak')"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSemanticSearch()}
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSemanticSearch}
              disabled={searching || !search.trim()}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  🔍 AI Search
                </>
              )}
            </button>
          </div>
          {useSemanticSearch && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-400">
              <span>✨ Using AI semantic search</span>
              <button
                onClick={() => {
                  setSearch('');
                  setUseSemanticSearch(false);
                  fetchPlaybooks();
                }}
                className="text-gray-400 hover:text-white"
              >
                (clear)
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading playbooks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPlaybooks.length === 0 && (
          <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No playbooks found</h3>
            <p className="text-gray-400 mb-6">
              {search ? 'Try a different search term' : 'Run extraction in the admin panel to create playbooks'}
            </p>
            {!search && (
              <Link
                href="/admin"
                className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
              >
                Go to Admin Panel
              </Link>
            )}
          </div>
        )}

        {/* Playbooks Grid */}
        {!loading && filteredPlaybooks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlaybooks.map((playbook) => (
              <Link
                key={playbook.id}
                href={`/playbooks/${playbook.id}`}
                className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 hover:border-purple-500/50 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition">
                      {playbook.task_name}
                    </h3>
                    {playbook.similarity !== undefined && (
                      <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
                        <span>✨ {playbook.similarity}% match</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">
                    {playbook.steps?.length || 0} steps
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {playbook.steps?.slice(0, 2).map((step, idx) => (
                    <div key={idx} className="text-sm text-gray-300 truncate">
                      {idx + 1}. {step.action}
                    </div>
                  ))}
                  {(playbook.steps?.length || 0) > 2 && (
                    <div className="text-xs text-gray-500">
                      +{(playbook.steps?.length || 0) - 2} more steps...
                    </div>
                  )}
                </div>

                {playbook.common_failures && playbook.common_failures.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-yellow-400">
                    <span>⚠️</span>
                    <span>{playbook.common_failures.length} common issues documented</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                  ID: #{playbook.id}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
