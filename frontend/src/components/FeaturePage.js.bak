import React, { useState, useEffect, useCallback } from 'react';
import { fetchAll, fetchOne, createItem, updateItem, deleteItem } from '../services/api';
import './FeaturePage.css';

const FeaturePage = ({ config }) => {
  const { title, apiResource, icon, columns, formFields, searchField } = config;
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAll(apiResource, search || undefined);
      setItems(res.data.data || res.data || []);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setItems([]);
    }
    setLoading(false);
  }, [apiResource, search]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleViewItem = async (item) => {
    try {
      const res = await fetchOne(apiResource, item._id || item.id);
      setSelectedItem(res.data.data || res.data);
      setView('detail');
    } catch {
      setSelectedItem(item);
      setView('detail');
    }
  };

  const handleCreate = () => {
    const initial = {};
    formFields.forEach(f => { initial[f.key] = ''; });
    setFormData(initial);
    setIsEditing(false);
    setView('form');
  };

  const handleEdit = () => {
    const data = {};
    formFields.forEach(f => {
      data[f.key] = selectedItem[f.key] || '';
    });
    setFormData(data);
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${title.slice(0, -1).toLowerCase()}?`)) return;
    try {
      await deleteItem(apiResource, selectedItem._id || selectedItem.id);
      setSuccessMsg('Item deleted successfully.');
      setView('list');
      loadItems();
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing) {
        await updateItem(apiResource, selectedItem._id || selectedItem.id, formData);
        setSuccessMsg('Item updated successfully.');
      } else {
        await createItem(apiResource, formData);
        setSuccessMsg('Item created successfully.');
      }
      setView('list');
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed. Please try again.');
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getStatusClass = (value) => {
    if (!value) return 'status-default';
    const normalized = String(value).toLowerCase().replace(/\s+/g, '-');
    return `status-${normalized}`;
  };

  const formatCellValue = (value, type) => {
    if (value === null || value === undefined || value === '') return '-';
    if (type === 'currency') return `$${Number(value).toFixed(2)}`;
    if (type === 'date') {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }
    if (type === 'status') {
      return <span className={`status-badge ${getStatusClass(value)}`}>{value}</span>;
    }
    return String(value);
  };

  const renderList = () => (
    <div className="fade-in">
      <div className="feature-header">
        <div>
          <h1 className="feature-title">
            <span className="feature-icon">{icon}</span>
            {title}
          </h1>
          <p className="feature-count">{items.length} record{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            placeholder={`Search by ${searchField ? searchField.replace(/_/g, ' ') : 'name'}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add New
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading {title.toLowerCase()}...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{icon}</div>
          <h3>No {title} Found</h3>
          <p>Get started by adding your first entry.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleCreate}>
            + Add New
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id || item.id || idx} onClick={() => handleViewItem(item)}>
                    {columns.map(col => (
                      <td key={col.key}>{formatCellValue(item[col.key], col.type)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetail = () => (
    <div className="fade-in">
      <div className="feature-header">
        <div>
          <h1 className="feature-title">
            <span className="feature-icon">{icon}</span>
            {title} Details
          </h1>
        </div>
      </div>

      <div className="toolbar-actions" style={{ marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => { setView('list'); setSelectedItem(null); }}>
          &larr; Back to List
        </button>
        <button className="btn btn-primary" onClick={handleEdit}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-body">
          <div className="detail-grid">
            {formFields.map(field => (
              <div key={field.key} className="detail-field">
                <div className="field-label">{field.label}</div>
                <div className="field-value">
                  {field.type === 'select' && selectedItem[field.key] ? (
                    <span className={`status-badge ${getStatusClass(selectedItem[field.key])}`}>
                      {selectedItem[field.key]}
                    </span>
                  ) : (
                    formatCellValue(selectedItem[field.key], field.type === 'number' && field.label.toLowerCase().includes('price') ? 'currency' : undefined)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="fade-in">
      <div className="feature-header">
        <div>
          <h1 className="feature-title">
            <span className="feature-icon">{icon}</span>
            {isEditing ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}
          </h1>
        </div>
      </div>

      <div className="toolbar-actions" style={{ marginBottom: 20 }}>
        <button className="btn btn-secondary" onClick={() => setView(isEditing ? 'detail' : 'list')}>
          &larr; Cancel
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="feature-form">
            <div className="form-grid">
              {formFields.map(field => (
                <div key={field.key} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="form-control"
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="form-control"
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="form-control"
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                {isEditing ? 'Update' : 'Create'} {title.replace(/s$/, '')}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => setView(isEditing ? 'detail' : 'list')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="feature-page">
      {view === 'list' && renderList()}
      {view === 'detail' && selectedItem && renderDetail()}
      {view === 'form' && renderForm()}
    </div>
  );
};

export default FeaturePage;
