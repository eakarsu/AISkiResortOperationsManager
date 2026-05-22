import React, { useState, useEffect } from 'react';

const GroomingReportPDF = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/grooming-report', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDownload = () => {
    if (!data?.pdf_body) return;
    const blob = new Blob([data.pdf_body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename?.replace('.pdf', '.txt') || 'grooming-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading grooming report...</div>;
  if (error) return <div style={{ padding: 20, color: 'crimson' }}>Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Grooming Report (PDF)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{ padding: '6px 14px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Refresh</button>
          <button onClick={handleDownload} style={{ padding: '6px 14px', border: 'none', background: '#0f172a', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Download PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#f1f5f9', padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Report Date</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{data.report_date}</div>
        </div>
        <div style={{ background: '#dcfce7', padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#15803d' }}>Groomed</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#14532d' }}>{data.summary.groomed} / {data.summary.total_trails}</div>
        </div>
        <div style={{ background: '#fef3c7', padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#92400e' }}>Ungroomed</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#78350f' }}>{data.summary.ungroomed}</div>
        </div>
        <div style={{ background: '#dbeafe', padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#1e40af' }}>Total Length</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>{data.summary.total_km} km</div>
        </div>
      </div>
      <pre style={{
        background: '#0f172a',
        color: '#cbd5e1',
        padding: 14,
        borderRadius: 6,
        fontSize: 11,
        maxHeight: 360,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        fontFamily: 'Menlo, monospace'
      }}>
        {data.pdf_body}
      </pre>
    </div>
  );
};

export default GroomingReportPDF;
