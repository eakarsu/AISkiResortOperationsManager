import React, { useState, useEffect } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AISnowConditionsPage = () => {
  const [detailLevel, setDetailLevel] = useState('Detailed');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openTrails, setOpenTrails] = useState([]);
  const [trailsLoading, setTrailsLoading] = useState(true);

  useEffect(() => {
    const fetchOpenTrails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/trails/open', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setOpenTrails(data.data || []);
      } catch (e) {}
      setTrailsLoading(false);
    };
    fetchOpenTrails();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await callAI('snow-conditions', { detail_level: detailLevel });
      setResult(res.data.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed');
    }
    setLoading(false);
  };

  const difficultyColors = { green: '#22c55e', blue: '#3b82f6', black: '#1e293b', 'double black': '#374151' };

  return (
    <div className="ai-feature-page fade-in">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title"><span className="ai-icon">🌨️</span>Snow Conditions Report<span className="ai-badge">AI</span></h1>
          <p className="ai-description">AI-generated comprehensive snow condition analysis and forecast.</p>
        </div>
      </div>

      {/* Open Trails Quick View Widget */}
      <div style={{ background: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid #334155' }}>
        <h3 style={{ color: '#22c55e', marginBottom: 12 }}>Open Trails Quick View ({openTrails.length} open)</h3>
        {trailsLoading ? (
          <div className="spinner" />
        ) : openTrails.length === 0 ? (
          <p style={{ color: '#64748b' }}>No open trails or data unavailable.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {openTrails.map((trail, i) => (
              <div key={i} style={{ background: '#0f172a', padding: 10, borderRadius: 8, borderLeft: `3px solid ${difficultyColors[trail.difficulty?.toLowerCase()] || '#6366f1'}` }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{trail.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{trail.difficulty} · {trail.conditions || 'Good'}</div>
                {trail.snowfall_last24h && <div style={{ fontSize: 12, color: '#38bdf8' }}>❄ {trail.snowfall_last24h}" in 24h</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ai-input-section card">
        <div className="card-header"><h2>Parameters</h2></div>
        <div className="card-body">
          <div className="ai-input-grid">
            <div className="form-group">
              <label>Detail Level</label>
              <select className="form-control" value={detailLevel} onChange={e => setDetailLevel(e.target.value)}>
                {['Summary', 'Detailed', 'Expert'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-accent btn-lg ai-generate-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }}></div>Analyzing...</> : <><span>⚡</span>Generate Snow Report</>}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && !loading && (
        <div className="ai-result-card">
          <h3><span>✨</span> Snow Conditions Analysis</h3>
          <AIStructuredResult result={result} endpoint="snow-conditions" />
        </div>
      )}
    </div>
  );
};

export default AISnowConditionsPage;
