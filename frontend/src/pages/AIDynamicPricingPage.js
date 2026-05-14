import React, { useState } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AIDynamicPricingPage = () => {
  const [date, setDate] = useState('');
  const [event, setEvent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyResult, setApplyResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [weatherSyncing, setWeatherSyncing] = useState(false);
  const [weatherResult, setWeatherResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setApplyResult(null);
    try {
      const res = await callAI('dynamic-pricing', { date, event });
      setResult(res.data.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed');
    }
    setLoading(false);
  };

  const handleApplyPricing = async () => {
    if (!result?.pricing_recommendations) return;
    setApplyLoading(true);
    setShowConfirm(false);
    try {
      const res = await callAI('apply-pricing', { pricing_recommendations: result.pricing_recommendations });
      setApplyResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Apply pricing failed');
    }
    setApplyLoading(false);
  };

  const handleWeatherSync = async () => {
    setWeatherSyncing(true);
    setWeatherResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/weather-stations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ station_name: 'Resort Summit' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setWeatherResult(data.station);
    } catch (err) {
      setError(err.message || 'Weather sync failed');
    }
    setWeatherSyncing(false);
  };

  return (
    <div className="ai-feature-page fade-in">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title">
            <span className="ai-icon">💰</span>
            Dynamic Pricing
            <span className="ai-badge">AI</span>
          </h1>
          <p className="ai-description">AI-powered dynamic lift ticket pricing based on real-time conditions, demand, and weather forecasts.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={handleWeatherSync}
          disabled={weatherSyncing}
          style={{ background: '#0ea5e9', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {weatherSyncing ? '⏳ Syncing...' : '🌦 Sync Live Weather'}
        </button>
        {weatherResult && (
          <div style={{ background: '#1e293b', padding: '8px 16px', borderRadius: 8, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>📍 {weatherResult.station_name}</span>
            <span>🌡 {weatherResult.temperature}°F</span>
            <span>💨 {weatherResult.wind_speed} mph</span>
            <span style={{ color: '#22c55e' }}>✓ Synced</span>
          </div>
        )}
      </div>

      <div className="ai-input-section card">
        <div className="card-header"><h2>Parameters</h2></div>
        <div className="card-body">
          <div className="ai-input-grid">
            <div className="form-group">
              <label>Target Date</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Special Event</label>
              <input type="text" className="form-control" value={event} onChange={e => setEvent(e.target.value)} placeholder="e.g. Holiday Weekend" />
            </div>
          </div>
          <button className="btn btn-accent btn-lg ai-generate-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }}></div>Analyzing...</> : <><span>⚡</span>Generate Pricing Analysis</>}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && !loading && (
        <div className="ai-result-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3><span>✨</span> AI Pricing Analysis Results</h3>
            {result.pricing_recommendations && (
              <button
                style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setShowConfirm(true)}
                disabled={applyLoading}
              >
                {applyLoading ? 'Applying...' : '✓ Apply Pricing'}
              </button>
            )}
          </div>

          {showConfirm && (
            <div style={{ background: '#1e293b', border: '1px solid #f97316', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <p style={{ color: '#f97316', marginBottom: 12 }}><strong>Confirm:</strong> Apply these price changes to all future lift tickets?</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleApplyPricing} style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>Yes, Apply</button>
                <button onClick={() => setShowConfirm(false)} style={{ background: '#475569', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {applyResult && (
            <div style={{ background: '#022c22', border: '1px solid #22c55e', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <p style={{ color: '#22c55e', fontWeight: 600 }}>{applyResult.message}</p>
              {applyResult.skipped?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ color: '#f97316', fontSize: 13 }}>Skipped ({applyResult.skipped.length}):</p>
                  {applyResult.skipped.map((s, i) => <div key={i} style={{ color: '#94a3b8', fontSize: 12 }}>{s.ticket_type}: {s.reason}</div>)}
                </div>
              )}
            </div>
          )}

          <AIStructuredResult result={result} endpoint="dynamic-pricing" />
        </div>
      )}
    </div>
  );
};

export default AIDynamicPricingPage;
