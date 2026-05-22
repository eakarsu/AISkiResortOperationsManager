import React, { useState, useEffect } from 'react';

const blankRule = { lift_name: '', open_time: '09:00', close_time: '16:00', snowmaking_enabled: false, min_temp: 28, max_wind: 35, notes: '' };

const OperationalRulesEditor = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(blankRule);
  const [editingId, setEditingId] = useState(null);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });

  const load = () => {
    setLoading(true);
    fetch('/api/custom-views/operational-rules', { headers: headers() })
      .then(r => r.json())
      .then(d => { setRules(d.rules || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await fetch('/api/custom-views/operational-rules', {
          method: 'PUT', headers: headers(), body: JSON.stringify({ ...form, id: editingId })
        });
      } else {
        await fetch('/api/custom-views/operational-rules', {
          method: 'POST', headers: headers(), body: JSON.stringify(form)
        });
      }
      setForm(blankRule);
      setEditingId(null);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleEdit = (rule) => {
    setForm(rule);
    setEditingId(rule.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await fetch('/api/custom-views/operational-rules', {
        method: 'DELETE', headers: headers(), body: JSON.stringify({ id })
      });
      load();
    } catch (e) { setError(e.message); }
  };

  const handleCancel = () => { setForm(blankRule); setEditingId(null); };

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>Operational Rules Editor</h3>
      <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: 13 }}>
        CRUD lift hours, snowmaking thresholds, and operational notes
      </p>
      {error && <div style={{ color: 'crimson', padding: 8, background: '#fef2f2', borderRadius: 4, marginBottom: 10 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
        <input required placeholder="Lift name" value={form.lift_name} onChange={e => setForm({ ...form, lift_name: e.target.value })} style={{ padding: 7, border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13 }} />
        <input type="time" value={form.open_time} onChange={e => setForm({ ...form, open_time: e.target.value })} style={{ padding: 7, border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13 }} />
        <input type="time" value={form.close_time} onChange={e => setForm({ ...form, close_time: e.target.value })} style={{ padding: 7, border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={form.snowmaking_enabled} onChange={e => setForm({ ...form, snowmaking_enabled: e.target.checked })} />
          Snowmaking
        </label>
        <input type="number" placeholder="Min temp F" value={form.min_temp} onChange={e => setForm({ ...form, min_temp: Number(e.target.value) })} style={{ padding: 7, border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13 }} />
        <input type="number" placeholder="Max wind mph" value={form.max_wind} onChange={e => setForm({ ...form, max_wind: Number(e.target.value) })} style={{ padding: 7, border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13 }} />
        <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ padding: 7, border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, gridColumn: 'span 2' }} />
        <div style={{ display: 'flex', gap: 6, gridColumn: 'span 4' }}>
          <button type="submit" style={{ padding: '7px 16px', border: 'none', background: '#0f172a', color: '#fff', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {editingId ? 'Update Rule' : 'Add Rule'}
          </button>
          {editingId && <button type="button" onClick={handleCancel} style={{ padding: '7px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Cancel</button>}
        </div>
      </form>

      {loading ? <div>Loading rules...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Lift</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Open</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Close</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Snowmaking</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Min Temp</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Max Wind</th>
              <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Notes</th>
              <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td style={{ padding: 8, fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{r.lift_name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{r.open_time}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{r.close_time}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{r.snowmaking_enabled ? 'Yes' : 'No'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{r.min_temp}F</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{r.max_wind}mph</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{r.notes}</td>
                <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                  <button onClick={() => handleEdit(r)} style={{ padding: '4px 10px', marginRight: 4, border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Edit</button>
                  <button onClick={() => handleDelete(r.id)} style={{ padding: '4px 10px', border: '1px solid #fecaca', background: '#fee2e2', color: '#991b1b', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OperationalRulesEditor;
