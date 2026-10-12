import React, { useState, useEffect } from 'react';
import { callAI } from '../services/api';
import './AIFeaturePage.css';
import JsonReport from './JsonReport';
import FullFieldPresets from './FullFieldPresets';

const AIFeaturePage = ({ config }) => {
  const { title, endpoint, icon, description, contextInfo, inputFields } = config;
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initial = {};
    inputFields.forEach(f => { initial[f.key] = ''; });
    setInputs(initial);
  }, [inputFields]);

  const handleChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const buildPresets = () => ['Scenario', 'Data sample', 'Executive review'].map((label, index) => ({
    label,
    values: Object.fromEntries(inputFields.map(field => {
      if (field.type === 'select' && field.options && field.options.length) {
        return [field.key, field.options[Math.min(index, field.options.length - 1)]];
      }
      if (field.type === 'number') return [field.key, String([30, 60, 90][index])];
      if (field.type === 'date' || field.type === 'datetime-local') {
        return [field.key, new Date(Date.now() + (index + 7) * 86400000).toISOString().slice(0, field.type === 'date' ? 10 : 16)];
      }
      return [field.key, `${label} example for ${field.label}: supply realistic operating context and review before generating.`];
    })),
  }));

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await callAI(endpoint, inputs);
      setResult(res.data.data || res.data.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page fade-in">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title">
            <span className="ai-icon">{icon}</span>
            {title}
            <span className="ai-badge">AI</span>
          </h1>
          <p className="ai-description">{description}</p>
        </div>
      </div>

      <div className="ai-info-card">
        <div className="ai-info-icon">&#9432;</div>
        <div>
          <strong>How it works:</strong> {contextInfo}
        </div>
      </div>

      <div className="ai-input-section card">
        <div className="card-header">
          <h2>Parameters</h2>
        </div>
        <div className="card-body">
          <FullFieldPresets value={inputs} presets={buildPresets()} disabled={loading} onChange={(next) => { setInputs(next); setError(''); }} />
          <div className="ai-input-grid">
            {inputFields.map(field => (
              <div key={field.key} className="form-group">
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="form-control"
                    value={inputs[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    className="form-control"
                    value={inputs[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            className="btn btn-accent btn-lg ai-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }}></div>
                Analyzing...
              </>
            ) : (
              <>
                <span>&#9889;</span>
                Generate Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div className="ai-loading-state">
          <div className="ai-loading-animation">
            <div className="ai-pulse-ring"></div>
            <div className="ai-pulse-ring delay-1"></div>
            <div className="ai-pulse-ring delay-2"></div>
            <span className="ai-loading-icon">{icon}</span>
          </div>
          <h3>AI is analyzing your data...</h3>
          <p>Processing resort conditions, historical patterns, and real-time data</p>
        </div>
      )}

      {result && !loading && (
        <div className="ai-result-card">
          <h3>
            <span>&#10024;</span>
            AI Analysis Results
          </h3>
          <div className="ai-result-content">
            <JsonReport data={result} title="AI Analysis Results" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFeaturePage;
