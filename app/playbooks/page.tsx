'use client';

import { useState, useEffect } from 'react';
import { Playbook } from '@/lib/types';
import Link from 'next/link';

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredPlaybooks = playbooks.filter(pb =>
    pb.task_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">📚 Playbooks</h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
            >
              Admin Panel
            </Link>
          </div>
          <p className="text-gray-400">
            AI-extracted operational playbooks from your documentation
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search playbooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
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
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition">
                    {playbook.task_name}
                  </h3>
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
