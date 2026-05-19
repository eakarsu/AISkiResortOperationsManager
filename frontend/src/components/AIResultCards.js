import React from 'react';
import { callAI } from '../services/api';

// Renders structured JSON AI result as cards
export function AIStructuredResult({ result, endpoint }) {
  if (!result) return null;

  // Dynamic pricing specific rendering
  if (endpoint === 'dynamic-pricing' && result.pricing_recommendations) {
    return (
      <div>
        <h3 style={{ color: '#6366f1', marginBottom: 12 }}>Pricing Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginBottom: 16 }}>
          {result.pricing_recommendations.map((rec, i) => (
            <div key={i} style={{ background: 'rgba(99,102,241,0.1)', padding: 16, borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)' }}>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{rec.ticket_type}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                {rec.current_price && <span style={{ color: '#64748b', textDecoration: 'line-through' }}>${rec.current_price}</span>}
                <span style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>${rec.new_price}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{rec.reason}</div>
              <div style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>Confidence: {(rec.confidence * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        {result.demand_forecast_24h && (
          <div style={{ background: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <strong style={{ color: '#e2e8f0' }}>Demand Forecast (24h):</strong>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>{result.demand_forecast_24h}</p>
          </div>
        )}
        {result.revenue_strategies && (
          <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
            <strong style={{ color: '#e2e8f0' }}>Revenue Strategies:</strong>
            <ul style={{ paddingLeft: 20, marginTop: 4 }}>
              {result.revenue_strategies.map((s, i) => <li key={i} style={{ color: '#94a3b8', marginBottom: 4 }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Snow conditions rendering
  if (endpoint === 'snow-conditions' && result.overall_rating) {
    const ratingColors = { excellent: '#22c55e', good: '#84cc16', fair: '#eab308', poor: '#ef4444' };
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#1e293b', padding: 16, borderRadius: 8, minWidth: 150 }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Overall Rating</div>
            <div style={{ color: ratingColors[result.overall_rating] || '#e2e8f0', fontSize: 22, fontWeight: 700, textTransform: 'uppercase' }}>{result.overall_rating}</div>
          </div>
          {result.base_depth_inches && (
            <div style={{ background: '#1e293b', padding: 16, borderRadius: 8, minWidth: 150 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>Base Depth</div>
              <div style={{ color: '#38bdf8', fontSize: 22, fontWeight: 700 }}>{result.base_depth_inches}"</div>
            </div>
          )}
          {result.snow_quality && (
            <div style={{ background: '#1e293b', padding: 16, borderRadius: 8 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>Snow Quality</div>
              <div style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>{result.snow_quality}</div>
            </div>
          )}
        </div>
        {result.executive_summary && <p style={{ color: '#94a3b8', marginBottom: 12 }}>{result.executive_summary}</p>}
        {result.trail_conditions && result.trail_conditions.length > 0 && (
          <div>
            <h4 style={{ color: '#e2e8f0', marginBottom: 8 }}>Trail Conditions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {result.trail_conditions.slice(0, 12).map((t, i) => (
                <div key={i} style={{ background: '#1e293b', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{t.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.condition}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Guest recommendations rendering
  if (endpoint === 'guest-recommendations' && result.trail_recommendations) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#1e293b', padding: 16, borderRadius: 8 }}>
            <h4 style={{ color: '#6366f1', marginBottom: 8 }}>Recommended Trails</h4>
            {result.trail_recommendations.slice(0, 5).map((t, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{t.name}</span>
                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>{t.difficulty}</span>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.reason}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', padding: 16, borderRadius: 8 }}>
            <h4 style={{ color: '#6366f1', marginBottom: 8 }}>Daily Itinerary</h4>
            {result.daily_itinerary?.slice(0, 5).map((item, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ color: '#6366f1', fontSize: 12, fontWeight: 600 }}>{item.time}</span>
                <div style={{ color: '#e2e8f0', fontSize: 13 }}>{item.activity}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{item.location}</div>
              </div>
            ))}
          </div>
        </div>
        {result.safety_tips && (
          <div style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
            <h4 style={{ color: '#eab308', marginBottom: 8 }}>Safety Tips</h4>
            <ul style={{ paddingLeft: 20 }}>
              {result.safety_tips.map((t, i) => <li key={i} style={{ color: '#94a3b8', marginBottom: 4 }}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Generic JSON render
  return (
    <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, fontFamily: 'monospace', fontSize: 13, color: '#94a3b8', overflowX: 'auto' }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default AIStructuredResult;
