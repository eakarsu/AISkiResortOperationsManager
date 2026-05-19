import React, { useState } from 'react';
import { callAI } from '../services/api';
import { AIStructuredResult } from '../components/AIResultCards';
import './AIFeaturePage.css';

const AIGuestRecommendationsPage = () => {
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [groupType, setGroupType] = useState('Couple');
  const [interests, setInterests] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await callAI('guest-recommendations', { guest_profile: { skill_level: skillLevel, group_type: groupType, interests } });
      setResult(res.data.result || res.data);
    } catch (err) { setError(err.response?.data?.error || 'AI analysis failed'); }
    setLoading(false);
  };

  return (
    <div className="ai-feature-page fade-in">
      <div className="ai-header"><div className="ai-header-content">
        <h1 className="ai-title"><span className="ai-icon">🎯</span>Guest Recommendations<span className="ai-badge">AI</span></h1>
        <p className="ai-description">Personalized AI recommendations based on conditions and preferences.</p>
      </div></div>
      <div className="ai-input-section card"><div className="card-header"><h2>Guest Profile</h2></div><div className="card-body">
        <div className="ai-input-grid">
          <div className="form-group"><label>Skill Level</label>
            <select className="form-control" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
              {['Beginner','Intermediate','Advanced','Expert'].map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div className="form-group"><label>Group Type</label>
            <select className="form-control" value={groupType} onChange={e => setGroupType(e.target.value)}>
              {['Solo','Couple','Family','Friends Group'].map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div className="form-group"><label>Interests</label>
            <input className="form-control" value={interests} onChange={e=>setInterests(e.target.value)} placeholder="powder skiing, après-ski..." /></div>
        </div>
        <button className="btn btn-accent btn-lg ai-generate-btn" onClick={handleGenerate} disabled={loading}>
          {loading?<><div className="spinner" style={{width:18,height:18,borderWidth:2,borderTopColor:'white'}}></div>Generating...</>:<><span>⚡</span>Get Recommendations</>}
        </button>
      </div></div>
      {error && <div className="alert alert-error">{error}</div>}
      {result && !loading && <div className="ai-result-card"><h3><span>✨</span> Personalized Recommendations</h3><AIStructuredResult result={result} endpoint="guest-recommendations" /></div>}
    </div>
  );
};

export default AIGuestRecommendationsPage;
