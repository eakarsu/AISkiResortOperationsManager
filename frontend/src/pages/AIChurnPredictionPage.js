import React, { useState } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AIChurnPredictionPage = () => {
  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await callAI('churn-prediction', { horizon_days: Number(days) });
      setResult(res.data.result || res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 503) {
        setError('AI service unavailable - OPENROUTER_API_KEY is not set on the server.');
      } else {
        setError(err.response?.data?.error || 'Prediction failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page">
      <div className="ai-feature-header">
        <h1>Churn Prediction</h1>
        <p>Identify season-pass holders and segments at risk of not returning.</p>
      </div>

      <div className="ai-feature-form">
        <div className="form-row">
          <div className="form-field">
            <label>Horizon (days)</label>
            <input type="number" min="7" max="365" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Predicting...' : 'Run Churn Prediction'}
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

export default AIChurnPredictionPage;
