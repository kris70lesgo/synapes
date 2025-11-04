'use client';

import { useState, useEffect } from 'react';
import { Playbook } from '@/lib/types';
import Link from 'next/link';
import { use } from 'react';

export default function PlaybookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchPlaybook();
  }, [id]);

  const fetchPlaybook = async () => {
    try {
      const res = await fetch(`/api/playbooks/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlaybook(data);
      }
    } catch (error) {
      console.error('Failed to fetch playbook:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (wasHelpful: boolean, comment?: string) => {
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbook_id: parseInt(id),
          user_query: playbook?.task_name || '',
          was_helpful: wasHelpful,
          comment,
        }),
      });

      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4">Loading playbook...</p>
        </div>
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Playbook not found</h2>
          <Link href="/playbooks" className="text-purple-400 hover:text-purple-300">
            ← Back to playbooks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/playbooks" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to playbooks
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{playbook.task_name}</h1>
          <div className="flex gap-3 text-sm text-gray-400">
            <span>Playbook #{playbook.id}</span>
            <span>•</span>
            <span>{playbook.steps?.length || 0} steps</span>
            {playbook.common_failures && playbook.common_failures.length > 0 && (
              <>
                <span>•</span>
                <span className="text-yellow-400">⚠️ {playbook.common_failures.length} known issues</span>
              </>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Steps</h2>
          <div className="space-y-4">
            {playbook.steps?.map((step, idx) => (
              <div key={idx} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm text-purple-300 mb-2 bg-black/50 rounded px-3 py-2">
                      {step.action}
                    </div>
                    <p className="text-gray-300 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Failures */}
        {playbook.common_failures && playbook.common_failures.length > 0 && (
          <div className="bg-yellow-500/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-yellow-500/30">
            <h2 className="text-xl font-semibold text-yellow-200 mb-4">⚠️ Common Issues & Fixes</h2>
            <div className="space-y-4">
              {playbook.common_failures.map((failure, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-4">
                  <div className="font-semibold text-red-400 mb-2">
                    Issue: {failure.issue}
                  </div>
                  <div className="text-green-400">
                    Fix: {failure.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">💬 Was this helpful?</h2>
          
          {!feedbackSubmitted ? (
            <div className="flex gap-4">
              <button
                onClick={() => submitFeedback(true)}
                disabled={submittingFeedback}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                👍 Yes, helpful
              </button>
              <button
                onClick={() => submitFeedback(false)}
                disabled={submittingFeedback}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                👎 Not helpful
              </button>
            </div>
          ) : (
            <div className="text-center py-4 bg-green-500/20 rounded-lg border border-green-500/50">
              <div className="text-green-400 font-semibold">✓ Thank you for your feedback!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
