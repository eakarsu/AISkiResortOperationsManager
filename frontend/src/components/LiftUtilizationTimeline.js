import React, { useState, useEffect } from 'react';

const LiftUtilizationTimeline = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/lift-utilization-timeline', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading lift utilization...</div>;
  if (error) return <div style={{ padding: 20, color: 'crimson' }}>Error: {error}</div>;
  if (!data) return null;

  const colorFor = (pct) => {
    if (pct > 80) return '#dc2626';
    if (pct > 60) return '#f59e0b';
    if (pct > 40) return '#10b981';
    return '#3b82f6';
  };

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>Lift Utilization Timeline</h3>
      <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: 13 }}>
        Peak: {data.summary?.peak_hour} | Avg utilization: {data.summary?.avg_utilization_pct}% | {data.summary?.total_lifts} lifts
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Lift</th>
              {data.hours.map(h => (
                <th key={h} style={{ padding: 6, textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lifts.map(lift => (
              <tr key={lift.lift_id}>
                <td style={{ padding: 8, fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>
                  {lift.lift_name}
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>cap {lift.capacity}</div>
                </td>
                {lift.series.map(cell => (
                  <td key={cell.hour} style={{ padding: 4, textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{
                      background: colorFor(cell.utilization_pct),
                      color: '#fff',
                      borderRadius: 4,
                      padding: '4px 2px',
                      fontWeight: 700,
                      fontSize: 11
                    }}>
                      {cell.utilization_pct}%
                    </div>
                    <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{cell.wait_minutes}m</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: '#64748b' }}>
        Cells: utilization % (top), wait minutes (bottom)
      </div>
    </div>
  );
};

export default LiftUtilizationTimeline;
