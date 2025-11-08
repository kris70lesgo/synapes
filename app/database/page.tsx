'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DatabaseStats {
  database: {
    database_name: string;
    database_size: string;
    active_connections: number;
  };
  extensions: Array<{
    extname: string;
    extversion: string;
  }>;
  indexes: Array<{
    indexname: string;
    indexdef: string;
    size: string;
  }>;
  table_sizes: Array<{
    tablename: string;
    total_size: string;
    table_size: string;
    indexes_size: string;
  }>;
  search_stats: {
    total_playbooks: number;
    fulltext_ready: number;
    semantic_ready: number;
    avg_confidence: number;
  };
  tiger_features: {
    fuzzy_search: boolean;
    fulltext_search: boolean;
    vector_search: boolean;
    timescaledb: boolean;
    compression_enabled: boolean;
    continuous_aggregates: boolean;
  };
}

export default function DatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/database/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4">Loading database stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🐘 Database Management</h1>
            <p className="text-gray-400">Tiger Postgres Advanced Features</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Database Info */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-gray-400 mb-1">Database</div>
            <div className="text-2xl font-bold text-white">{stats?.database.database_name}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-gray-400 mb-1">Total Size</div>
            <div className="text-2xl font-bold text-white">{stats?.database.database_size}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-gray-400 mb-1">Active Connections</div>
            <div className="text-2xl font-bold text-white">{stats?.database.active_connections}</div>
          </div>
        </div>

        {/* Tiger Features */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🚀 Tiger Postgres Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats?.tiger_features && Object.entries(stats.tiger_features).map(([key, enabled]) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-gray-300 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${
                  enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Capabilities */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🔍 Search Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
              <div className="text-sm text-purple-300 mb-1">Total Playbooks</div>
              <div className="text-3xl font-bold text-white">{stats?.search_stats.total_playbooks}</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
              <div className="text-sm text-blue-300 mb-1">Full-Text Ready</div>
              <div className="text-3xl font-bold text-white">{stats?.search_stats.fulltext_ready}</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
              <div className="text-sm text-green-300 mb-1">Semantic Ready</div>
              <div className="text-3xl font-bold text-white">{stats?.search_stats.semantic_ready}</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-sm text-yellow-300 mb-1">Avg Confidence</div>
              <div className="text-3xl font-bold text-white">
                {stats?.search_stats.avg_confidence ? (stats.search_stats.avg_confidence * 100).toFixed(0) + '%' : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Table Sizes */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Table Sizes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Table</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Size</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Table Size</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Index Size</th>
                </tr>
              </thead>
              <tbody>
                {stats?.table_sizes.map((table) => (
                  <tr key={table.tablename} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-mono">{table.tablename}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{table.total_size}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{table.table_size}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{table.indexes_size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extensions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🔌 Extensions</h2>
            <div className="space-y-3">
              {stats?.extensions.map((ext) => (
                <div key={ext.extname} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white font-mono">{ext.extname}</span>
                  <span className="text-gray-400 text-sm">{ext.extversion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indexes */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">📇 Indexes ({stats?.indexes.length})</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {stats?.indexes.slice(0, 10).map((idx) => (
                <div key={idx.indexname} className="p-2 bg-white/5 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-mono">{idx.indexname}</span>
                    <span className="text-gray-400 text-xs">{idx.size}</span>
                  </div>
                </div>
              ))}
              {stats && stats.indexes.length > 10 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  +{stats.indexes.length - 10} more indexes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Database Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-3"
              onClick={() => window.open('https://console.cloud.timescale.com', '_blank')}
            >
              <span>🌐</span>
              <div className="text-left">
                <div className="font-semibold">Tiger Console</div>
                <div className="text-xs opacity-80">Manage database</div>
              </div>
            </button>
            
            <button
              className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center gap-3"
              onClick={fetchStats}
            >
              <span>🔄</span>
              <div className="text-left">
                <div className="font-semibold">Refresh Stats</div>
                <div className="text-xs opacity-80">Update metrics</div>
              </div>
            </button>

            <Link
              href="/admin"
              className="px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition flex items-center gap-3"
            >
              <span>🚀</span>
              <div className="text-left">
                <div className="font-semibold">Extract Playbooks</div>
                <div className="text-xs opacity-80">Run extraction</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
