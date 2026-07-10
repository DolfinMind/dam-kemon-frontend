import { useState, useEffect } from 'react';
import { getFeedback } from '../../api/admin';
import { MessageSquare, Calendar, Mail, User } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFeedback()
      .then((res) => setFeedback(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-red">
        <p className="font-semibold mb-2">Failed to load feedback</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!feedback) {
    return <div className="py-12"><LoadingSpinner text="Loading feedback entries..." /></div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-ink/70" />
        <h2 className="text-xl font-bold text-ink">User Feedback ({feedback.length})</h2>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-gray">No feedback entries yet.</div>
        ) : (
          <div className="divide-y divide-line">
            {feedback.map((item, i) => (
              <div key={item.id || i} className="p-5 sm:p-6 hover:bg-cream-soft transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <User className="w-4 h-4 text-gray" />
                      {item.name || 'Anonymous User'}
                    </div>
                    {item.email && (
                      <div className="flex items-center gap-1.5 text-sm text-gray">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${item.email}`} className="hover:text-ink transition-colors underline decoration-transparent hover:decoration-ink">
                          {item.email}
                        </a>
                      </div>
                    )}
                  </div>
                  {item.submittedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-gray font-mono bg-surface px-2 py-1 rounded">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.submittedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="bg-surface border border-line-strong rounded-xl p-4 text-sm text-ink whitespace-pre-wrap leading-relaxed shadow-inner shadow-ink/5">
                  {item.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
