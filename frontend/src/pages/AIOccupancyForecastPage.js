import React, { useState } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AIOccupancyForecastPage = () => {
  const [days, setDays] = useState(14);
  const [weatherContext, setWeatherContext] = useState('');
  const [eventContext, setEventContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await callAI('occupancy-forecast', {
        days: Number(days),
        weather_context: weatherContext,
        event_context: eventContext,
      });
      setResult(res.data.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Forecast failed');
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="ai-feature-header">
        <h1>Occupancy Forecast</h1>
        <p>N-day visitor forecast over historical + on-the-books + active season passes.</p>
      </div>

      <div className="ai-feature-form">
        <div className="form-row">
          <div className="form-field">
            <label>Forecast horizon (days)</label>
            <input type="number" min="1" max="120" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Weather context (optional)</label>
            <textarea rows={2} value={weatherContext} onChange={(e) => setWeatherContext(e.target.value)} placeholder="e.g. 6 inches forecast Friday, warmup over weekend" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Events / promotions context</label>
            <textarea rows={2} value={eventContext} onChange={(e) => setEventContext(e.target.value)} placeholder="e.g. local school break, planned race weekend" />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Forecasting...' : 'Generate Forecast'}
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

export default AIOccupancyForecastPage;
