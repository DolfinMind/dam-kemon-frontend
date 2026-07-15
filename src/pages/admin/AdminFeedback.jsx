import { useState, useEffect, useMemo } from 'react';
import { getFeedback } from '../../api/admin';
import { MessageSquare, Calendar, Mail, User, Activity } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFeedback()
      .then((res) => setFeedback(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const analytics = useMemo(() => {
    if (!feedback) return null;
    
    let likes = 0;
    let dislikes = 0;
    const writtenMessages = [];
    const trendMap = {}; 

    feedback.forEach(item => {
      if (item.submittedAt) {
        const d = new Date(item.submittedAt).toISOString().split('T')[0];
        trendMap[d] = (trendMap[d] || 0) + 1;
      }

      const isPulse = item.name === 'pulse';
      if (isPulse && item.message) {
        if (item.message.startsWith('PULSE up')) likes++;
        else if (item.message.startsWith('PULSE down')) dislikes++;
      } else {
        writtenMessages.push(item);
      }
    });

    const totalVotes = likes + dislikes;
    const likeRatio = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 0;

    const trendData = Object.entries(trendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14) 
      .map(([date, count]) => ({ date: date.slice(5), count })); 

    const pieData = [
      { name: 'Likes', value: likes, color: '#10B981' },
      { name: 'Dislikes', value: dislikes, color: '#EF4444' }
    ];

    return { likes, dislikes, likeRatio, writtenMessages, trendData, pieData, totalVotes };
  }, [feedback]);

  if (error) {
    return (
      <div className="text-center py-12 text-red">
        <p className="font-semibold mb-2">Failed to load feedback</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!feedback || !analytics) {
    return <div className="py-12"><LoadingSpinner text="Loading feedback entries..." /></div>;
  }

  const { likes, dislikes, likeRatio, writtenMessages, trendData, pieData, totalVotes } = analytics;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-ink/70" />
        <h2 className="text-xl font-bold text-ink">Feedback Analytics</h2>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-line rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <p className="text-sm font-bold text-gray mb-1 uppercase tracking-wider">Satisfaction</p>
          <div className="text-4xl font-extrabold text-ink mb-2">
            {likeRatio}%
          </div>
          <p className="text-sm text-gray">
            {likes} likes, {dislikes} dislikes
          </p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-48">
          <p className="text-sm font-bold text-gray mb-2 uppercase tracking-wider text-center">Likes vs Dislikes</p>
          <div className="w-full h-full pb-6">
            {totalVotes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray text-sm">No votes yet</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-48">
          <p className="text-sm font-bold text-gray mb-2 uppercase tracking-wider text-center">Volume (14 Days)</p>
          <div className="w-full h-full pb-6">
             {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} />
                    <RechartsTooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray text-sm">No activity</div>
             )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-ink/70" />
          <h2 className="text-xl font-bold text-ink">Written Feedback ({writtenMessages.length})</h2>
        </div>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        {writtenMessages.length === 0 ? (
          <div className="p-8 text-center text-gray">No written messages yet.</div>
        ) : (
          <div className="divide-y divide-line">
            {writtenMessages.map((item, i) => {
              const isDetail = item.name === 'pulse-detail';
              return (
                <div key={item.id || i} className="p-5 sm:p-6 hover:bg-cream-soft transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        {isDetail ? <Activity className="w-4 h-4 text-acid-deep" /> : <User className="w-4 h-4 text-gray" />}
                        {isDetail ? 'Pulse Follow-up' : (item.name || 'Anonymous User')}
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
                  <div className={`bg-surface border border-line-strong rounded-xl p-4 text-sm text-ink whitespace-pre-wrap leading-relaxed shadow-inner shadow-ink/5 ${isDetail ? 'border-acid/30 bg-cream/30' : ''}`}>
                    {item.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
