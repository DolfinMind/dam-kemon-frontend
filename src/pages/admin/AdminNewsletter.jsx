import { useEffect, useState } from 'react';
import { newsletterAnalytics, listSubscribers, triggerNewsletter } from '../../api/admin';
import { Mail, Send, Users, Activity, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminNewsletter() {
  const [analytics, setAnalytics] = useState(null);
  const [subscribers, setSubscribers] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [sentOk, setSentOk] = useState(false);
  const [page, setPage] = useState(0);

  const load = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const [stats, subs] = await Promise.all([
        newsletterAnalytics(),
        listSubscribers(pageNumber)
      ]);
      setAnalytics(stats.data);
      setSubscribers(subs.data);
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    if (!window.confirm("Are you sure you want to trigger the weekly newsletter to all subscribers right now?")) return;
    setSending(true);
    setSentMessage('');
    try {
      const res = await triggerNewsletter();
      setSentOk(!!res.data.success);
      setSentMessage(res.data.message || (res.data.success ? 'Newsletter sent.' : 'Nothing was sent.'));
      if (res.data.success) load(page);   // refresh stats after a real send
    } catch {
      setSentOk(false);
      setSentMessage('Failed to trigger newsletter.');
    } finally {
      setSending(false);
    }
  };

  if (loading && !analytics) return <LoadingSpinner text="Loading newsletter data…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Newsletter Management</h1>
          <p className="text-sm text-gray">Monitor subscribers and trigger manual sends.</p>
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-full font-semibold hover:bg-ink/90 disabled:opacity-50 transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Weekly Digest Now
        </button>
      </div>

      {sentMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${sentOk ? 'bg-green/10 text-green' : 'bg-red-soft text-red'}`}>
          {sentOk ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />} {sentMessage}
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5 text-blue" />} label="Total Subscribers" value={analytics.total} />
          <StatCard icon={<Mail className="w-5 h-5 text-green" />} label="New (Last 7 Days)" value={analytics.last7Days} />
          <StatCard icon={<Mail className="w-5 h-5 text-yellow" />} label="New (Last 30 Days)" value={analytics.last30Days} />
          <StatCard icon={<Activity className="w-5 h-5 text-purple" />} label="30-Day Growth" value={`${analytics.growthRate}%`} />
        </div>
      )}

      <div className="card p-0 overflow-hidden mt-8">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold">Subscribers List</h2>
          <span className="text-xs text-gray">Showing page {page + 1} of {subscribers.totalPages || 1}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-mono uppercase tracking-wider text-gray bg-cream-soft">
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3 text-right">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.content.map((sub) => (
                <tr key={sub.id} className="border-t border-line/50 hover:bg-cream-soft/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{sub.email}</td>
                  <td className="px-4 py-3 text-right text-gray">{new Date(sub.subscribedAt).toLocaleString()}</td>
                </tr>
              ))}
              {subscribers.content.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-gray">No subscribers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {subscribers.totalPages > 1 && (
          <div className="p-4 border-t border-line flex justify-between items-center bg-cream-soft">
            <button
              disabled={page === 0}
              onClick={() => load(page - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-line rounded bg-white hover:bg-cream disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-gray">Page {page + 1} of {subscribers.totalPages}</span>
            <button
              disabled={page >= subscribers.totalPages - 1}
              onClick={() => load(page + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-line rounded bg-white hover:bg-cream disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-5 flex items-center gap-4 border border-line bg-white rounded-xl shadow-sm">
      <div className="p-3 bg-cream rounded-full border border-line/50">{icon}</div>
      <div>
        <div className="text-xs text-gray font-medium uppercase tracking-wider mb-1">{label}</div>
        <div className="text-2xl font-semibold font-mono tracking-tight">{value}</div>
      </div>
    </div>
  );
}
