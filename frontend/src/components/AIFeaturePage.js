import React, { useState, useEffect } from 'react';
import { callAI } from '../services/api';
import './AIFeaturePage.css';

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

  const formatAIContent = (text) => {
    if (!text) return '';
    if (typeof text === 'object') {
      text = JSON.stringify(text, null, 2);
    }
    let html = String(text);

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Headers: ### Header or ## Header or # Header
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');

    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    // Numbers/metrics highlighting: $123, 95%, etc.
    html = html.replace(/\$[\d,]+(\.\d{2})?/g, '<span class="metric-highlight">$&</span>');
    html = html.replace(/\b\d+(\.\d+)?%/g, '<span class="metric-highlight">$&</span>');

    // Bullet points: - item or * item
    html = html.replace(/^[\s]*[-*] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Numbered lists: 1. item
    html = html.replace(/^[\s]*\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => {
      if (match.includes('<ul>')) return match;
      return `<ul>${match}</ul>`;
    });

    // Line breaks to paragraphs
    html = html.replace(/\n{2,}/g, '</p><p>');
    html = html.replace(/\n/g, '<br/>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*<(h[2-4])/g, '<$1');
    html = html.replace(/<\/(h[2-4])>\s*<\/p>/g, '</$1>');
    html = html.replace(/<p>\s*<ul>/g, '<ul>');
    html = html.replace(/<\/ul>\s*<\/p>/g, '</ul>');

    return html;
  };

  const getResultText = (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (data.analysis) return data.analysis;
    if (data.result) return data.result;
    if (data.recommendations) return data.recommendations;
    if (data.content) return data.content;
    if (data.report) return data.report;
    if (data.prediction) return data.prediction;
    if (data.message) return data.message;
    return JSON.stringify(data, null, 2);
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
          <div
            className="ai-result-content"
            dangerouslySetInnerHTML={{ __html: formatAIContent(getResultText(result)) }}
          />
        </div>
      )}
    </div>
  );
};

export default AIFeaturePage;
