'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analytics {
  overview: {
    documents: number;
    playbooks: number;
    feedback: number;
    avgSteps: string;
  };
  timeline: Array<{ date: string; count: string }>;
  commonFailures: Array<{ issue: string; count: number }>;
  feedbackStats: {
    helpful: number;
    notHelpful: number;
    total: number;
    helpfulRate: number;
  };
  topPlaybooks: Array<{ id: number; task_name: string; step_count: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics</h1>
            <p className="text-gray-400">Insights into your playbook collection</p>
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">📄 Documents</div>
            <div className="text-4xl font-bold text-white">{analytics.overview.documents}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">📚 Playbooks</div>
            <div className="text-4xl font-bold text-white">{analytics.overview.playbooks}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">📝 Avg Steps</div>
            <div className="text-4xl font-bold text-white">{analytics.overview.avgSteps}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">💬 Feedback</div>
            <div className="text-4xl font-bold text-white">{analytics.overview.feedback}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Timeline */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">📅 Recent Activity</h2>
            {analytics.timeline.length > 0 ? (
              <div className="space-y-3">
                {analytics.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-300">{new Date(item.date).toLocaleDateString()}</span>
                    <span className="text-purple-400 font-semibold">{item.count} playbooks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recent activity</p>
            )}
          </div>

          {/* Feedback Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">💬 Feedback Stats</h2>
            {analytics.feedbackStats.total > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">👍 Helpful</span>
                  <span className="text-green-400 font-semibold">{analytics.feedbackStats.helpful}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">👎 Not Helpful</span>
                  <span className="text-red-400 font-semibold">{analytics.feedbackStats.notHelpful}</span>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="text-gray-400 text-sm mb-2">Helpful Rate</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${analytics.feedbackStats.helpfulRate}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold">{analytics.feedbackStats.helpfulRate}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No feedback yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Common Failures */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">⚠️ Common Issues</h2>
            {analytics.commonFailures.length > 0 ? (
              <div className="space-y-3">
                {analytics.commonFailures.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3">
                    <span className="text-gray-300 text-sm flex-1">{item.issue}</span>
                    <span className="text-yellow-400 font-semibold text-sm">{item.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No common issues documented</p>
            )}
          </div>

          {/* Top Playbooks */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">🏆 Most Detailed Playbooks</h2>
            {analytics.topPlaybooks.length > 0 ? (
              <div className="space-y-3">
                {analytics.topPlaybooks.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/playbooks/${item.id}`}
                    className="flex items-start justify-between gap-3 hover:bg-white/5 p-2 rounded-lg transition"
                  >
                    <span className="text-gray-300 text-sm flex-1">{item.task_name}</span>
                    <span className="text-purple-400 font-semibold text-sm">{item.step_count} steps</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No playbooks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
