import React, { useState } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AIAvalancheRiskAssessmentPage = () => {
  const [zone, setZone] = useState('');
  const [aspect, setAspect] = useState('NE');
  const [elevation, setElevation] = useState('above_treeline');
  const [recentSnowfall, setRecentSnowfall] = useState('');
  const [windAndTemps, setWindAndTemps] = useState('');
  const [snowpackNotes, setSnowpackNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!zone.trim()) {
      setError('Zone or area is required.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await callAI('avalanche-risk-assessment', {
        zone,
        aspect,
        elevation,
        recent_snowfall: recentSnowfall,
        wind_and_temps: windAndTemps,
        snowpack_notes: snowpackNotes,
      });
      setResult(res.data.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Assessment failed');
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="ai-feature-header">
        <h1>Avalanche Risk Assessment</h1>
        <p>NAADS-aligned danger rating with control recommendations.</p>
      </div>

      <div className="ai-feature-form">
        <div className="form-row">
          <div className="form-field">
            <label>Zone *</label>
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g. Bowl 2 — North Face" />
          </div>
          <div className="form-field">
            <label>Aspect</label>
            <select value={aspect} onChange={(e) => setAspect(e.target.value)}>
              {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Elevation band</label>
            <select value={elevation} onChange={(e) => setElevation(e.target.value)}>
              <option value="below_treeline">Below treeline</option>
              <option value="near_treeline">Near treeline</option>
              <option value="above_treeline">Above treeline</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Recent snowfall</label>
            <textarea rows={2} value={recentSnowfall} onChange={(e) => setRecentSnowfall(e.target.value)} placeholder="e.g. 14 inches in last 24h, dense" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Wind & temps</label>
            <textarea rows={2} value={windAndTemps} onChange={(e) => setWindAndTemps(e.target.value)} placeholder="e.g. SW 30-40 mph gusting, low 20s F" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Snowpack notes</label>
            <textarea rows={2} value={snowpackNotes} onChange={(e) => setSnowpackNotes(e.target.value)} placeholder="Persistent weak layer at 60cm, etc." />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Assessing...' : 'Assess Avalanche Risk'}
        </button>
        {error && <div className="ai-feature-error">{error}</div>}
      </div>

      {result && (
        <div className="ai-feature-result">
          <AIStructuredResult data={result} />
        </div>
      )}
    </div>
  );
};

export default AIAvalancheRiskAssessmentPage;
