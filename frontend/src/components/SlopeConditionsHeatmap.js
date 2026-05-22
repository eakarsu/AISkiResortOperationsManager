import React, { useState, useEffect } from 'react';

const SlopeConditionsHeatmap = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/slope-conditions-heatmap', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading slope heatmap...</div>;
  if (error) return <div style={{ padding: 20, color: 'crimson' }}>Error: {error}</div>;
  if (!data) return null;

  const colorFor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#65a30d';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#dc2626';
    return '#1f2937';
  };

  const diffEmoji = (d) => ({ beginner: 'G', intermediate: 'B', expert: 'X' }[d] || '?');

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>Slope Conditions Heatmap</h3>
      <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: 13 }}>
        Best window: {data.summary?.best_window} | {data.summary?.total_trails} trails | Slope x Time grid
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3 }}>
          <thead>
            <tr>
              <th style={{ padding: 6, textAlign: 'left', fontSize: 12, color: '#475569' }}>Trail</th>
              {data.hours.map(h => (
                <th key={h} style={{ padding: 6, textAlign: 'center', fontSize: 11, color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.trails.map(t => (
              <tr key={t.trail_id}>
                <td style={{ padding: 6, fontSize: 12, fontWeight: 600 }}>
                  <span style={{
                    display: 'inline-block', width: 18, height: 18,
                    background: t.difficulty === 'expert' ? '#1e293b' : t.difficulty === 'intermediate' ? '#3b82f6' : '#22c55e',
                    color: '#fff', borderRadius: '50%', textAlign: 'center', lineHeight: '18px',
                    fontSize: 10, marginRight: 6
                  }}>{diffEmoji(t.difficulty)}</span>
                  {t.trail_name}
                </td>
                {t.cells.map(cell => (
                  <td key={cell.hour} style={{
                    background: colorFor(cell.score),
                    color: '#fff',
                    padding: '10px 6px',
                    textAlign: 'center',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: 12,
                    minWidth: 50
                  }}>
                    {cell.score}
                    <div style={{ fontSize: 9, opacity: 0.85, fontWeight: 400 }}>{cell.label}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 11, color: '#64748b', flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#059669', borderRadius: 2, marginRight: 4 }} />Excellent 80+</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#65a30d', borderRadius: 2, marginRight: 4 }} />Good 60-79</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4 }} />Fair 40-59</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#dc2626', borderRadius: 2, marginRight: 4 }} />Poor &lt;40</span>
      </div>
    </div>
  );
};

export default SlopeConditionsHeatmap;
