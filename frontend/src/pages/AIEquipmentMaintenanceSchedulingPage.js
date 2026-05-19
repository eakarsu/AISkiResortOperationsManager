import React, { useState } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AIEquipmentMaintenanceSchedulingPage = () => {
  const [horizonDays, setHorizonDays] = useState(30);
  const [includeLifts, setIncludeLifts] = useState(true);
  const [includeGrooming, setIncludeGrooming] = useState(true);
  const [includeSnowmaking, setIncludeSnowmaking] = useState(true);
  const [openHoursOnly, setOpenHoursOnly] = useState(false);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await callAI('equipment-maintenance-scheduling', {
        horizon_days: Number(horizonDays),
        include_lifts: includeLifts,
        include_grooming: includeGrooming,
        include_snowmaking: includeSnowmaking,
        open_hours_only: openHoursOnly,
        notes,
      });
      setResult(res.data.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scheduling failed');
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="ai-feature-header">
        <h1>Equipment Maintenance Scheduling</h1>
        <p>Predictive PM windows for lifts/equipment with conflict detection.</p>
      </div>

      <div className="ai-feature-form">
        <div className="form-row">
          <div className="form-field">
            <label>Horizon (days)</label>
            <input type="number" min="1" max="180" value={horizonDays} onChange={(e) => setHorizonDays(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Lifts</label>
            <select value={String(includeLifts)} onChange={(e) => setIncludeLifts(e.target.value === 'true')}>
              <option value="true">Include</option>
              <option value="false">Exclude</option>
            </select>
          </div>
          <div className="form-field">
            <label>Grooming</label>
            <select value={String(includeGrooming)} onChange={(e) => setIncludeGrooming(e.target.value === 'true')}>
              <option value="true">Include</option>
              <option value="false">Exclude</option>
            </select>
          </div>
          <div className="form-field">
            <label>Snowmaking</label>
            <select value={String(includeSnowmaking)} onChange={(e) => setIncludeSnowmaking(e.target.value === 'true')}>
              <option value="true">Include</option>
              <option value="false">Exclude</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Open hours only?</label>
            <select value={String(openHoursOnly)} onChange={(e) => setOpenHoursOnly(e.target.value === 'true')}>
              <option value="false">No (off-hours OK)</option>
              <option value="true">Yes (open hours)</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Constraints / notes</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Parts on order, scheduled events, weather windows..." />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Scheduling...' : 'Generate PM Schedule'}
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

export default AIEquipmentMaintenanceSchedulingPage;
